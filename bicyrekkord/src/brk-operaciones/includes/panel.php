<?php
/**
 * Panel "Pedidos BRK": una sola pantalla para mover pedidos de estado con un clic.
 * Recibido → Alistando → Enviado (transportadora + guía) → Entregado.
 */
defined( 'ABSPATH' ) || exit;

function brk_panel_pestanas() {
	return array(
		'recibidos'  => array( 'label' => 'Por alistar', 'estados' => array( 'processing' ) ),
		'alistando'  => array( 'label' => 'Alistando', 'estados' => array( 'alistando' ) ),
		'enviados'   => array( 'label' => 'Enviados', 'estados' => array( 'enviado' ) ),
		'entregados' => array( 'label' => 'Entregados', 'estados' => array( 'completed' ) ),
		'espera'     => array( 'label' => 'Pago pendiente', 'estados' => array( 'pending', 'on-hold' ) ),
		'todos'      => array( 'label' => 'Todos', 'estados' => array( 'pending', 'on-hold', 'processing', 'alistando', 'enviado', 'completed', 'cancelled', 'refunded', 'failed' ) ),
	);
}

function brk_panel_conteos() {
	$c = array();
	foreach ( brk_panel_pestanas() as $k => $p ) {
		if ( 'todos' === $k ) {
			continue;
		}
		$n = 0;
		foreach ( $p['estados'] as $e ) {
			$n += (int) wc_orders_count( $e );
		}
		$c[ $k ] = $n;
	}
	return $c;
}

add_action( 'admin_menu', function () {
	$hook = add_menu_page( 'Pedidos BRK', 'Pedidos BRK', 'edit_shop_orders', 'brk-pedidos', 'brk_panel_render', 'dashicons-clipboard', 3 );
	add_action( 'admin_print_styles-' . $hook, function () {
		wp_enqueue_style( 'brk-panel', BRK_OPS_URL . 'assets/admin.css', array(), BRK_OPS_VERSION );
		wp_enqueue_script( 'brk-panel', BRK_OPS_URL . 'assets/admin.js', array(), BRK_OPS_VERSION, true );
		wp_localize_script( 'brk-panel', 'BRK_PANEL', array(
			'ajax'  => admin_url( 'admin-ajax.php' ),
			'nonce' => wp_create_nonce( 'brk_panel' ),
		) );
	} );
	$n = (int) wc_orders_count( 'processing' );
	if ( $n ) {
		global $menu;
		foreach ( $menu as $i => $m ) {
			if ( 'brk-pedidos' === $m[2] ) {
				$menu[ $i ][0] .= ' <span class="awaiting-mod count-' . $n . '"><span class="pending-count">' . $n . '</span></span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
			}
		}
	}
} );

function brk_panel_render() {
	$tabs = brk_panel_pestanas();
	$tab  = isset( $_GET['tab'] ) && isset( $tabs[ $_GET['tab'] ] ) ? sanitize_key( $_GET['tab'] ) : 'recibidos'; // phpcs:ignore
	$q    = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : ''; // phpcs:ignore
	$pag  = max( 1, isset( $_GET['pag'] ) ? (int) $_GET['pag'] : 1 ); // phpcs:ignore
	$por  = 30;
	$cnt  = brk_panel_conteos();

	if ( $q ) {
		$ids    = function_exists( 'wc_order_search' ) ? wc_order_search( $q ) : array();
		$orders = array();
		foreach ( array_slice( array_unique( array_map( 'intval', $ids ) ), 0, 200 ) as $id ) {
			$o = wc_get_order( $id );
			if ( $o && ! $o instanceof WC_Order_Refund ) {
				$orders[] = $o;
			}
		}
		$total  = count( $orders );
		$orders = array_slice( $orders, ( $pag - 1 ) * $por, $por );
	} else {
		$res    = wc_get_orders( array(
			'status'   => $tabs[ $tab ]['estados'],
			'limit'    => $por,
			'paged'    => $pag,
			'paginate' => true,
			'orderby'  => 'date',
			'order'    => in_array( $tab, array( 'recibidos', 'alistando' ), true ) ? 'ASC' : 'DESC',
			'type'     => 'shop_order',
		) );
		$orders = $res->orders;
		$total  = (int) $res->total;
	}
	$base = admin_url( 'admin.php?page=brk-pedidos' );
	?>
	<div class="wrap brk-panel">
		<div class="brk-panel__top">
			<h1>Pedidos</h1>
			<form method="get" class="brk-buscar" role="search">
				<input type="hidden" name="page" value="brk-pedidos">
				<label class="screen-reader-text" for="brk-q">Buscar pedido</label>
				<input type="search" id="brk-q" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="Buscar por # de pedido, nombre, celular o correo">
				<button class="button">Buscar</button>
			</form>
		</div>

		<?php if ( ! $q ) : ?>
		<nav class="brk-tabs" aria-label="Estados">
			<?php foreach ( $tabs as $k => $t ) : ?>
				<a href="<?php echo esc_url( add_query_arg( 'tab', $k, $base ) ); ?>" class="brk-tab<?php echo $k === $tab ? ' is-on' : ''; ?>" <?php echo $k === $tab ? 'aria-current="page"' : ''; ?>>
					<?php echo esc_html( $t['label'] ); ?>
					<?php if ( isset( $cnt[ $k ] ) ) : ?><span class="brk-count" data-tab="<?php echo esc_attr( $k ); ?>"><?php echo (int) $cnt[ $k ]; ?></span><?php endif; ?>
				</a>
			<?php endforeach; ?>
		</nav>
		<?php else : ?>
			<p class="brk-res"><?php echo (int) $total; ?> resultado(s) para «<?php echo esc_html( $q ); ?>» · <a href="<?php echo esc_url( $base ); ?>">Volver</a></p>
		<?php endif; ?>

		<div class="brk-bulk" hidden>
			<span><strong class="brk-bulk__n">0</strong> seleccionados</span>
			<button type="button" class="button" data-bulk="alistando">Pasar a Alistando</button>
			<button type="button" class="button" data-bulk="enviado">Pasar a Enviado</button>
			<button type="button" class="button" data-bulk="completed">Marcar Entregado</button>
		</div>

		<?php if ( ! $orders ) : ?>
			<div class="brk-vacio">No hay pedidos en esta pestaña.</div>
		<?php else : ?>
		<div class="brk-lista" role="list">
			<?php foreach ( $orders as $o ) { brk_panel_fila( $o ); } ?>
		</div>
		<?php endif; ?>

		<?php
		$paginas = (int) ceil( $total / $por );
		if ( $paginas > 1 ) {
			echo '<div class="brk-pag">';
			for ( $i = 1; $i <= $paginas; $i++ ) {
				$u = add_query_arg( array( 'tab' => $tab, 'pag' => $i, 'q' => $q ), $base );
				echo '<a class="' . ( $i === $pag ? 'is-on' : '' ) . '" href="' . esc_url( $u ) . '">' . (int) $i . '</a>';
			}
			echo '</div>';
		}
		?>
		<datalist id="brk-transportadoras">
			<?php foreach ( brk_transportadoras() as $t ) : ?><option value="<?php echo esc_attr( $t ); ?>"></option><?php endforeach; ?>
		</datalist>
	</div>
	<?php
}

function brk_panel_fila( $o ) {
	$estado = $o->get_status();
	$flujo  = brk_flujo();
	$f      = $flujo[ $estado ] ?? null;
	$items  = array();
	foreach ( $o->get_items() as $it ) {
		$items[] = $it->get_quantity() . '× ' . $it->get_name();
	}
	$resumen = implode( ' · ', array_slice( $items, 0, 2 ) ) . ( count( $items ) > 2 ? ' · +' . ( count( $items ) - 2 ) . ' más' : '' );
	$uid     = $o->get_customer_id();
	$fecha   = $o->get_date_created();
	$fe      = 'si' === $o->get_meta( '_brk_fe' );
	$guia    = $o->get_meta( '_brk_guia' );
	?>
	<div class="brk-fila" role="listitem" data-id="<?php echo (int) $o->get_id(); ?>" data-estado="<?php echo esc_attr( $estado ); ?>">
		<label class="brk-check"><input type="checkbox" value="<?php echo (int) $o->get_id(); ?>"><span class="screen-reader-text">Seleccionar pedido <?php echo esc_html( $o->get_order_number() ); ?></span></label>
		<div class="brk-fila__info">
			<div class="brk-fila__l1">
				<a class="brk-num" href="<?php echo esc_url( $o->get_edit_order_url() ); ?>">#<?php echo esc_html( $o->get_order_number() ); ?></a>
				<strong class="brk-cliente"><?php echo esc_html( $o->get_formatted_billing_full_name() ); ?></strong>
				<?php if ( brk_es_taller( $uid ) ) : ?><span class="brk-badge brk-badge--taller">Taller</span><?php endif; ?>
				<?php if ( $fe ) : ?><span class="brk-badge brk-badge--fe" title="<?php echo $o->get_meta( '_brk_fe_enviada' ) ? 'Solicitud enviada a contabilidad' : 'Solicitud pendiente de envío'; ?>">Factura electrónica<?php echo $o->get_meta( '_brk_fe_enviada' ) ? ' ✓' : ''; ?></span><?php endif; ?>
			</div>
			<div class="brk-fila__l2">
				<span><?php echo esc_html( $o->get_billing_city() ? $o->get_billing_city() : '—' ); ?></span>
				<span><?php echo $fecha ? esc_html( human_time_diff( $fecha->getTimestamp() ) . ' atrás' ) : ''; ?></span>
				<span><?php echo esc_html( $o->get_payment_method_title() ); ?></span>
				<span><a href="tel:<?php echo esc_attr( brk_digitos( $o->get_billing_phone() ) ); ?>"><?php echo esc_html( $o->get_billing_phone() ); ?></a></span>
			</div>
			<div class="brk-fila__items"><?php echo esc_html( $resumen ); ?></div>
			<?php if ( $guia ) : ?><div class="brk-fila__guia"><?php echo esc_html( $o->get_meta( '_brk_transportadora' ) . ' · Guía ' . $guia ); ?></div><?php endif; ?>
		</div>
		<div class="brk-fila__total"><?php echo wp_kses_post( $o->get_formatted_order_total() ); ?></div>
		<div class="brk-fila__estado"><span class="brk-pill brk-pill--<?php echo esc_attr( $estado ); ?>"><?php echo esc_html( wc_get_order_status_name( $estado ) ); ?></span></div>
		<div class="brk-fila__accion">
			<?php if ( $f && $f['siguiente'] ) : ?>
				<?php if ( 'enviado' === $f['siguiente'] ) : ?>
					<form class="brk-envio" data-id="<?php echo (int) $o->get_id(); ?>">
						<label class="screen-reader-text" for="brk-t-<?php echo (int) $o->get_id(); ?>">Transportadora</label>
						<input id="brk-t-<?php echo (int) $o->get_id(); ?>" name="transportadora" list="brk-transportadoras" placeholder="Transportadora" required>
						<label class="screen-reader-text" for="brk-g-<?php echo (int) $o->get_id(); ?>">Número de guía</label>
						<input id="brk-g-<?php echo (int) $o->get_id(); ?>" name="guia" placeholder="N.º de guía">
						<button class="button button-primary brk-go">Marcar como Enviado</button>
					</form>
				<?php else : ?>
					<button type="button" class="button button-primary brk-go" data-estado="<?php echo esc_attr( $f['siguiente'] ); ?>"><?php echo esc_html( $f['accion'] ); ?></button>
				<?php endif; ?>
			<?php elseif ( in_array( $estado, array( 'pending', 'on-hold' ), true ) ) : ?>
				<button type="button" class="button button-primary brk-go" data-estado="processing">Confirmar pago</button>
			<?php endif; ?>
			<details class="brk-mas">
				<summary>Más</summary>
				<div>
					<?php foreach ( wc_get_order_statuses() as $k => $label ) : $k = substr( $k, 3 ); if ( $k === $estado || in_array( $k, array( 'checkout-draft' ), true ) ) { continue; } ?>
						<button type="button" class="brk-go-alt" data-estado="<?php echo esc_attr( $k ); ?>">Cambiar a <?php echo esc_html( $label ); ?></button>
					<?php endforeach; ?>
					<?php if ( $fe ) : ?><button type="button" class="brk-fe-reenviar">Reenviar factura a contabilidad</button><?php endif; ?>
					<a href="<?php echo esc_url( $o->get_edit_order_url() ); ?>">Abrir pedido completo</a>
				</div>
			</details>
		</div>
	</div>
	<?php
}

add_action( 'wp_ajax_brk_panel_estado', function () {
	check_ajax_referer( 'brk_panel', 'nonce' );
	if ( ! current_user_can( 'edit_shop_orders' ) ) {
		wp_send_json_error( array( 'msg' => 'Sin permiso.' ), 403 );
	}
	$ids    = isset( $_POST['ids'] ) ? array_map( 'intval', (array) wp_unslash( $_POST['ids'] ) ) : array();
	$estado = isset( $_POST['estado'] ) ? sanitize_key( wp_unslash( $_POST['estado'] ) ) : '';
	$trans  = isset( $_POST['transportadora'] ) ? sanitize_text_field( wp_unslash( $_POST['transportadora'] ) ) : '';
	$guia   = isset( $_POST['guia'] ) ? sanitize_text_field( wp_unslash( $_POST['guia'] ) ) : '';
	if ( ! wc_is_order_status( 'wc-' . $estado ) ) {
		wp_send_json_error( array( 'msg' => 'Estado no válido.' ), 400 );
	}
	$hechos = array();
	foreach ( $ids as $id ) {
		$o = wc_get_order( $id );
		if ( $o ) {
			brk_cambiar_estado( $o, $estado, $trans, $guia );
			$hechos[] = $id;
		}
	}
	wp_send_json_success( array(
		'ids'      => $hechos,
		'etiqueta' => wc_get_order_status_name( $estado ),
		'estado'   => $estado,
		'conteos'  => brk_panel_conteos(),
	) );
} );

add_action( 'wp_ajax_brk_panel_fe', function () {
	check_ajax_referer( 'brk_panel', 'nonce' );
	if ( ! current_user_can( 'edit_shop_orders' ) ) {
		wp_send_json_error( array( 'msg' => 'Sin permiso.' ), 403 );
	}
	$o = wc_get_order( isset( $_POST['id'] ) ? (int) $_POST['id'] : 0 );
	if ( ! $o ) {
		wp_send_json_error( array( 'msg' => 'Pedido no encontrado.' ), 404 );
	}
	$ok = brk_enviar_solicitud_fe( $o );
	wp_send_json_success( array( 'ok' => $ok, 'msg' => $ok ? 'Enviada a ' . brk_correo_contabilidad() : 'No se pudo enviar el correo.' ) );
} );
