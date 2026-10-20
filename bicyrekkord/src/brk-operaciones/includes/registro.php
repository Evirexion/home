<?php
/**
 * Registro de cuentas: Cliente o Taller.
 * A un taller que aún no está en la base de datos de Bicyrekkord se le exige NIT o documento.
 */
defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	if ( ! function_exists( 'is_account_page' ) ) {
		return;
	}
	if ( is_account_page() || is_checkout() ) {
		wp_enqueue_style( 'brk-ops', BRK_OPS_URL . 'assets/front.css', array(), BRK_OPS_VERSION );
		wp_enqueue_script( 'brk-ops', BRK_OPS_URL . 'assets/front.js', array( 'jquery' ), BRK_OPS_VERSION, true );
		wp_localize_script( 'brk-ops', 'BRK_OPS', array(
			'ajax'  => admin_url( 'admin-ajax.php' ),
			'nonce' => wp_create_nonce( 'brk_verificar_taller' ),
		) );
	}
} );

function brk_post( $k ) {
	return isset( $_POST[ $k ] ) ? sanitize_text_field( wp_unslash( $_POST[ $k ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
}

add_action( 'woocommerce_register_form_start', function () {
	$tipo = brk_post( 'brk_tipo_cuenta' ) ?: 'cliente';
	?>
	<fieldset class="brk-tipo-cuenta">
		<legend>¿Qué tipo de cuenta quieres crear?</legend>
		<label class="brk-opcion"><input type="radio" name="brk_tipo_cuenta" value="cliente" <?php checked( $tipo, 'cliente' ); ?>>
			<span><strong>Cliente</strong><small>Compro repuestos para mi vehículo</small></span></label>
		<label class="brk-opcion"><input type="radio" name="brk_tipo_cuenta" value="taller" <?php checked( $tipo, 'taller' ); ?>>
			<span><strong>Taller</strong><small>Tengo un taller de vehículos eléctricos</small></span></label>
	</fieldset>
	<div class="brk-fila">
		<p class="form-row form-row-first"><label for="brk_nombre">Nombre <span class="required">*</span></label>
			<input type="text" class="input-text" name="brk_nombre" id="brk_nombre" autocomplete="given-name" value="<?php echo esc_attr( brk_post( 'brk_nombre' ) ); ?>"></p>
		<p class="form-row form-row-last"><label for="brk_apellido">Apellido <span class="required">*</span></label>
			<input type="text" class="input-text" name="brk_apellido" id="brk_apellido" autocomplete="family-name" value="<?php echo esc_attr( brk_post( 'brk_apellido' ) ); ?>"></p>
	</div>
	<p class="form-row form-row-wide"><label for="brk_celular">Celular <span class="required">*</span></label>
		<input type="tel" class="input-text" name="brk_celular" id="brk_celular" autocomplete="tel" inputmode="tel" value="<?php echo esc_attr( brk_post( 'brk_celular' ) ); ?>"></p>
	<div class="brk-taller" <?php echo 'taller' === $tipo ? '' : 'hidden'; ?>>
		<p class="form-row form-row-wide"><label for="brk_taller_nombre">Nombre del taller <span class="required">*</span></label>
			<input type="text" class="input-text" name="brk_taller_nombre" id="brk_taller_nombre" autocomplete="organization" value="<?php echo esc_attr( brk_post( 'brk_taller_nombre' ) ); ?>"></p>
		<p class="form-row form-row-wide"><label for="brk_ciudad">Ciudad <span class="required">*</span></label>
			<input type="text" class="input-text" name="brk_ciudad" id="brk_ciudad" autocomplete="address-level2" value="<?php echo esc_attr( brk_post( 'brk_ciudad' ) ); ?>"></p>
		<div class="brk-verificacion" aria-live="polite"></div>
		<div class="brk-documento">
			<p class="brk-nota">Si tu taller aún no está en nuestra base de datos, necesitamos el NIT o tu documento de identidad.</p>
			<div class="brk-fila">
				<p class="form-row form-row-first"><label for="brk_doc_tipo">Tipo de documento</label>
					<select name="brk_doc_tipo" id="brk_doc_tipo">
						<?php foreach ( brk_tipos_documento() as $k => $v ) : ?>
							<option value="<?php echo esc_attr( $k ); ?>" <?php selected( brk_post( 'brk_doc_tipo' ), $k ); ?>><?php echo esc_html( $v ); ?></option>
						<?php endforeach; ?>
					</select></p>
				<p class="form-row form-row-last"><label for="brk_doc_numero">Número <span class="brk-doc-req">(obligatorio si eres nuevo)</span></label>
					<input type="text" class="input-text" name="brk_doc_numero" id="brk_doc_numero" inputmode="numeric" placeholder="900123456-7" value="<?php echo esc_attr( brk_post( 'brk_doc_numero' ) ); ?>"></p>
			</div>
		</div>
	</div>
	<?php
} );

add_filter( 'woocommerce_registration_errors', function ( $errors, $username, $email ) {
	// Solo valida el formulario de "Mi cuenta" (no el registro durante el checkout).
	if ( ! isset( $_POST['brk_tipo_cuenta'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return $errors;
	}
	$tipo = brk_post( 'brk_tipo_cuenta' );
	if ( ! brk_post( 'brk_nombre' ) || ! brk_post( 'brk_apellido' ) ) {
		$errors->add( 'brk_nombre', 'Escribe tu nombre y apellido.' );
	}
	if ( strlen( brk_celular( brk_post( 'brk_celular' ) ) ) < 7 ) {
		$errors->add( 'brk_celular', 'Escribe un número de celular válido.' );
	}
	if ( 'taller' === $tipo ) {
		if ( ! brk_post( 'brk_taller_nombre' ) ) {
			$errors->add( 'brk_taller_nombre', 'Escribe el nombre del taller.' );
		}
		if ( ! brk_post( 'brk_ciudad' ) ) {
			$errors->add( 'brk_ciudad', 'Escribe la ciudad del taller.' );
		}
		$doc   = brk_post( 'brk_doc_numero' );
		$match = BRK_Talleres::buscar( $doc, $email, brk_post( 'brk_celular' ) );
		if ( ! $match && strlen( brk_digitos( $doc ) ) < 5 ) {
			$errors->add( 'brk_doc_numero', 'Tu taller aún no está en nuestra base de datos. Para crear la cuenta necesitamos el <strong>NIT o documento de identidad</strong>.' );
		} elseif ( $doc && ( strlen( brk_digitos( $doc ) ) < 5 || strlen( brk_digitos( $doc ) ) > 15 ) ) {
			$errors->add( 'brk_doc_numero', 'Revisa el número de NIT o documento.' );
		}
	}
	return $errors;
}, 10, 3 );

add_action( 'woocommerce_created_customer', function ( $user_id ) {
	if ( ! isset( $_POST['brk_tipo_cuenta'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return;
	}
	$tipo    = 'taller' === brk_post( 'brk_tipo_cuenta' ) ? 'taller' : 'cliente';
	$nombre  = brk_post( 'brk_nombre' );
	$apell   = brk_post( 'brk_apellido' );
	$celular = brk_post( 'brk_celular' );
	$user    = get_userdata( $user_id );

	wp_update_user( array( 'ID' => $user_id, 'first_name' => $nombre, 'last_name' => $apell, 'display_name' => trim( $nombre . ' ' . $apell ) ) );
	update_user_meta( $user_id, 'billing_first_name', $nombre );
	update_user_meta( $user_id, 'billing_last_name', $apell );
	update_user_meta( $user_id, 'billing_phone', $celular );
	update_user_meta( $user_id, 'brk_tipo_cuenta', $tipo );

	if ( 'taller' !== $tipo ) {
		return;
	}
	$doc_tipo = brk_post( 'brk_doc_tipo' );
	$doc_num  = brk_post( 'brk_doc_numero' );
	$taller   = brk_post( 'brk_taller_nombre' );
	$ciudad   = brk_post( 'brk_ciudad' );
	$match    = BRK_Talleres::buscar( $doc_num, $user ? $user->user_email : '', $celular );

	update_user_meta( $user_id, 'billing_company', $taller );
	update_user_meta( $user_id, 'billing_city', $ciudad );
	update_user_meta( $user_id, 'brk_taller_nombre', $taller );
	if ( $doc_num ) {
		update_user_meta( $user_id, 'brk_doc_tipo', array_key_exists( $doc_tipo, brk_tipos_documento() ) ? $doc_tipo : 'NIT' );
		update_user_meta( $user_id, 'brk_doc_numero', $doc_num );
	} elseif ( $match && $match->nit_texto ) {
		update_user_meta( $user_id, 'brk_doc_tipo', 'NIT' );
		update_user_meta( $user_id, 'brk_doc_numero', $match->nit_texto );
	}
	if ( $match ) {
		update_user_meta( $user_id, 'brk_taller_estado', 'en_base' );
		update_user_meta( $user_id, 'brk_taller_id', (int) $match->id );
	} else {
		update_user_meta( $user_id, 'brk_taller_estado', 'nuevo' );
		BRK_Talleres::guardar( array( 'nit' => $doc_num, 'nombre' => $taller, 'ciudad' => $ciudad, 'celular' => $celular, 'correo' => $user ? $user->user_email : '' ), 'registro' );
	}
	$u = new WP_User( $user_id );
	$u->set_role( 'taller' );
} );

/** Comprobación en vivo (solo responde sí/no, nunca datos del taller). */
add_action( 'wp_ajax_nopriv_brk_verificar_taller', 'brk_ajax_verificar_taller' );
add_action( 'wp_ajax_brk_verificar_taller', 'brk_ajax_verificar_taller' );
function brk_ajax_verificar_taller() {
	check_ajax_referer( 'brk_verificar_taller', 'nonce' );
	$ip    = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$clave = 'brk_vt_' . md5( $ip );
	$n     = (int) get_transient( $clave );
	if ( $n > 30 ) {
		wp_send_json_error( array( 'msg' => 'Demasiados intentos, intenta más tarde.' ), 429 );
	}
	set_transient( $clave, $n + 1, HOUR_IN_SECONDS );
	$correo  = isset( $_POST['correo'] ) ? sanitize_email( wp_unslash( $_POST['correo'] ) ) : '';
	$celular = isset( $_POST['celular'] ) ? sanitize_text_field( wp_unslash( $_POST['celular'] ) ) : '';
	$doc     = isset( $_POST['doc'] ) ? sanitize_text_field( wp_unslash( $_POST['doc'] ) ) : '';
	wp_send_json_success( array( 'encontrado' => (bool) BRK_Talleres::buscar( $doc, $correo, $celular ) ) );
}

/** Documento en "Detalles de la cuenta" (sirve para pre-llenar la factura electrónica). */
add_action( 'woocommerce_edit_account_form', function () {
	$uid = get_current_user_id();
	$t   = get_user_meta( $uid, 'brk_doc_tipo', true );
	?>
	<fieldset>
		<legend>Documento para facturación</legend>
		<p class="form-row form-row-first"><label for="brk_doc_tipo">Tipo de documento</label>
			<select name="brk_doc_tipo" id="brk_doc_tipo">
				<?php foreach ( brk_tipos_documento() as $k => $v ) : ?>
					<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $t, $k ); ?>><?php echo esc_html( $v ); ?></option>
				<?php endforeach; ?>
			</select></p>
		<p class="form-row form-row-last"><label for="brk_doc_numero">Número</label>
			<input type="text" class="input-text" name="brk_doc_numero" id="brk_doc_numero" value="<?php echo esc_attr( get_user_meta( $uid, 'brk_doc_numero', true ) ); ?>"></p>
		<div class="clear"></div>
	</fieldset>
	<?php
} );
add_action( 'woocommerce_save_account_details', function ( $user_id ) {
	if ( isset( $_POST['brk_doc_numero'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		$t = brk_post( 'brk_doc_tipo' );
		update_user_meta( $user_id, 'brk_doc_tipo', array_key_exists( $t, brk_tipos_documento() ) ? $t : 'CC' );
		update_user_meta( $user_id, 'brk_doc_numero', brk_post( 'brk_doc_numero' ) );
	}
} );

/** Columna "Tipo" en la lista de usuarios del administrador. */
add_filter( 'manage_users_columns', function ( $c ) {
	$c['brk_tipo'] = 'Tipo de cuenta';
	return $c;
} );
add_filter( 'manage_users_custom_column', function ( $v, $col, $uid ) {
	if ( 'brk_tipo' !== $col ) {
		return $v;
	}
	if ( ! brk_es_taller( $uid ) ) {
		return get_user_meta( $uid, 'brk_tipo_cuenta', true ) ? 'Cliente' : '—';
	}
	$e = get_user_meta( $uid, 'brk_taller_estado', true );
	return 'Taller · ' . ( 'en_base' === $e ? 'en base de datos' : 'nuevo' );
}, 10, 3 );
