<?php
/**
 * Pedidos BRK › Talleres y ajustes: importar la base de talleres (CSV de Excel o Google Sheets),
 * ver talleres registrados y configurar el correo de contabilidad y las transportadoras.
 */
defined( 'ABSPATH' ) || exit;

add_action( 'admin_menu', function () {
	$hook = add_submenu_page( 'brk-pedidos', 'Talleres y ajustes', 'Talleres y ajustes', 'manage_woocommerce', 'brk-ajustes', 'brk_ajustes_render' );
	add_submenu_page( 'brk-pedidos', 'Pedidos', 'Pedidos', 'edit_shop_orders', 'brk-pedidos' );
	add_action( 'admin_print_styles-' . $hook, function () {
		wp_enqueue_style( 'brk-panel', BRK_OPS_URL . 'assets/admin.css', array(), BRK_OPS_VERSION );
	} );
}, 20 );

add_action( 'admin_post_brk_guardar_ajustes', function () {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( 'Sin permiso.' );
	}
	check_admin_referer( 'brk_ajustes' );
	$correo = isset( $_POST['brk_fe_correo'] ) ? sanitize_email( wp_unslash( $_POST['brk_fe_correo'] ) ) : '';
	update_option( 'brk_fe_correo', $correo ? $correo : 'contabilidad@bicyrekkord.com' );
	update_option( 'brk_transportadoras', isset( $_POST['brk_transportadoras'] ) ? sanitize_textarea_field( wp_unslash( $_POST['brk_transportadoras'] ) ) : '' );
	wp_safe_redirect( admin_url( 'admin.php?page=brk-ajustes&ok=ajustes' ) );
	exit;
} );

add_action( 'admin_post_brk_importar_talleres', function () {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( 'Sin permiso.' );
	}
	check_admin_referer( 'brk_importar' );
	$res = array( 'error' => 'No se recibió ningún archivo.' );
	if ( ! empty( $_FILES['brk_csv']['tmp_name'] ) && is_uploaded_file( $_FILES['brk_csv']['tmp_name'] ) ) { // phpcs:ignore
		$ext = strtolower( pathinfo( sanitize_file_name( $_FILES['brk_csv']['name'] ?? '' ), PATHINFO_EXTENSION ) ); // phpcs:ignore
		if ( 'csv' !== $ext && 'txt' !== $ext ) {
			$res = array( 'error' => 'Sube el archivo en formato CSV (en Excel: Archivo › Guardar como › CSV; en Google Sheets: Archivo › Descargar › CSV).' );
		} else {
			$res = BRK_Talleres::importar_csv( $_FILES['brk_csv']['tmp_name'] ); // phpcs:ignore
		}
	}
	set_transient( 'brk_import_res_' . get_current_user_id(), $res, 120 );
	wp_safe_redirect( admin_url( 'admin.php?page=brk-ajustes&ok=import' ) );
	exit;
} );

function brk_ajustes_render() {
	$q   = isset( $_GET['tq'] ) ? sanitize_text_field( wp_unslash( $_GET['tq'] ) ) : ''; // phpcs:ignore
	$res = get_transient( 'brk_import_res_' . get_current_user_id() );
	delete_transient( 'brk_import_res_' . get_current_user_id() );
	$registrados = get_users( array( 'role' => 'taller', 'number' => 50, 'orderby' => 'registered', 'order' => 'DESC' ) );
	?>
	<div class="wrap brk-panel brk-ajustes">
		<h1>Talleres y ajustes</h1>
		<?php if ( isset( $_GET['ok'] ) && 'ajustes' === $_GET['ok'] ) : // phpcs:ignore ?>
			<div class="notice notice-success"><p>Ajustes guardados.</p></div>
		<?php endif; ?>
		<?php if ( $res ) : ?>
			<div class="notice <?php echo ! empty( $res['error'] ) ? 'notice-error' : 'notice-success'; ?>"><p>
				<?php echo ! empty( $res['error'] ) ? esc_html( $res['error'] ) : sprintf( 'Importación lista: %d nuevos, %d actualizados, %d filas omitidas (sin NIT, correo ni celular).', (int) $res['nuevos'], (int) $res['actualizados'], (int) $res['omitidos'] ); ?>
			</p></div>
		<?php endif; ?>

		<div class="brk-cols">
			<section class="brk-card">
				<h2>Base de datos de talleres <span class="brk-count"><?php echo (int) BRK_Talleres::contar(); ?></span></h2>
				<p>Sube la lista de talleres que ya trabajan con Bicyrekkord. Cuando un taller cree su cuenta, el sitio lo reconoce por <strong>NIT, correo o celular</strong>. Si no está en esta lista, se le pide el NIT o documento de identidad.</p>
				<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<?php wp_nonce_field( 'brk_importar' ); ?>
					<input type="hidden" name="action" value="brk_importar_talleres">
					<label for="brk_csv"><strong>Archivo CSV</strong></label><br>
					<input type="file" id="brk_csv" name="brk_csv" accept=".csv,text/csv" required>
					<p class="description">Columnas reconocidas (en cualquier orden): <code>NIT</code> o <code>Documento</code>, <code>Nombre</code> o <code>Taller</code>, <code>Ciudad</code>, <code>Celular</code> o <code>Teléfono</code>, <code>Correo</code>. Si un NIT ya existe, se actualizan sus datos.</p>
					<p><button class="button button-primary">Importar talleres</button></p>
				</form>
				<form method="get" class="brk-buscar">
					<input type="hidden" name="page" value="brk-ajustes">
					<label class="screen-reader-text" for="brk-tq">Buscar taller</label>
					<input type="search" id="brk-tq" name="tq" value="<?php echo esc_attr( $q ); ?>" placeholder="Buscar por nombre, NIT, ciudad o correo">
					<button class="button">Buscar</button>
				</form>
				<div class="brk-tabla-wrap">
					<table class="widefat striped">
						<thead><tr><th>Taller</th><th>NIT / documento</th><th>Ciudad</th><th>Celular</th><th>Correo</th><th>Origen</th></tr></thead>
						<tbody>
						<?php foreach ( BRK_Talleres::listar( $q ) as $t ) : ?>
							<tr><td><?php echo esc_html( $t->nombre ); ?></td><td><?php echo esc_html( $t->nit_texto ); ?></td><td><?php echo esc_html( $t->ciudad ); ?></td><td><?php echo esc_html( $t->celular ); ?></td><td><?php echo esc_html( $t->correo ); ?></td><td><?php echo 'registro' === $t->origen ? '<span class="brk-badge brk-badge--nuevo">Registro web</span>' : 'Importado'; ?></td></tr>
						<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			</section>

			<section class="brk-card">
				<h2>Talleres con cuenta en la web</h2>
				<?php if ( ! $registrados ) : ?>
					<p>Aún no hay talleres registrados.</p>
				<?php else : ?>
				<div class="brk-tabla-wrap">
					<table class="widefat striped">
						<thead><tr><th>Taller</th><th>Contacto</th><th>Documento</th><th>Estado</th></tr></thead>
						<tbody>
						<?php foreach ( $registrados as $u ) : $e = get_user_meta( $u->ID, 'brk_taller_estado', true ); ?>
							<tr>
								<td><a href="<?php echo esc_url( get_edit_user_link( $u->ID ) ); ?>"><?php echo esc_html( get_user_meta( $u->ID, 'brk_taller_nombre', true ) ); ?></a><br><small><?php echo esc_html( get_user_meta( $u->ID, 'billing_city', true ) ); ?></small></td>
								<td><?php echo esc_html( $u->display_name ); ?><br><small><?php echo esc_html( $u->user_email . ' · ' . get_user_meta( $u->ID, 'billing_phone', true ) ); ?></small></td>
								<td><?php echo esc_html( trim( get_user_meta( $u->ID, 'brk_doc_tipo', true ) . ' ' . get_user_meta( $u->ID, 'brk_doc_numero', true ) ) ); ?></td>
								<td><?php echo 'en_base' === $e ? '<span class="brk-badge brk-badge--ok">En base de datos</span>' : '<span class="brk-badge brk-badge--nuevo">Nuevo · validar</span>'; ?></td>
							</tr>
						<?php endforeach; ?>
						</tbody>
					</table>
				</div>
				<?php endif; ?>

				<h2 style="margin-top:32px">Ajustes</h2>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<?php wp_nonce_field( 'brk_ajustes' ); ?>
					<input type="hidden" name="action" value="brk_guardar_ajustes">
					<p><label for="brk_fe_correo"><strong>Correo de contabilidad</strong> (recibe las solicitudes de factura electrónica)</label><br>
						<input type="email" class="regular-text" id="brk_fe_correo" name="brk_fe_correo" value="<?php echo esc_attr( brk_correo_contabilidad() ); ?>"></p>
					<p><label for="brk_transportadoras"><strong>Transportadoras</strong> (una por línea)</label><br>
						<textarea id="brk_transportadoras" name="brk_transportadoras" rows="6" class="large-text"><?php echo esc_textarea( implode( "\n", brk_transportadoras() ) ); ?></textarea></p>
					<p><button class="button button-primary">Guardar ajustes</button></p>
				</form>
			</section>
		</div>
	</div>
	<?php
}
