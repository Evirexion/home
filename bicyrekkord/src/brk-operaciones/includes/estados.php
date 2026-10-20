<?php
/**
 * Estados de pedido Bicyrekkord: Recibido → Alistando → Enviado (con guía) → Entregado.
 * "Recibido" es el estado "processing" de WooCommerce y "Entregado" es "completed",
 * así los reportes, inventario y pasarelas de pago siguen funcionando igual.
 */
defined( 'ABSPATH' ) || exit;

function brk_flujo() {
	return array(
		'processing' => array( 'label' => 'Recibido', 'accion' => 'Pasar a Alistando', 'siguiente' => 'alistando' ),
		'alistando'  => array( 'label' => 'Alistando', 'accion' => 'Marcar como Enviado', 'siguiente' => 'enviado' ),
		'enviado'    => array( 'label' => 'Enviado', 'accion' => 'Marcar como Entregado', 'siguiente' => 'completed' ),
		'completed'  => array( 'label' => 'Entregado', 'accion' => '', 'siguiente' => '' ),
	);
}

/** Paso del seguimiento (0–3) que corresponde a un estado. */
function brk_paso( $estado ) {
	$pasos = array( 'pending' => 0, 'on-hold' => 0, 'processing' => 0, 'alistando' => 1, 'enviado' => 2, 'completed' => 3 );
	return $pasos[ $estado ] ?? -1;
}

add_action( 'init', function () {
	register_post_status( 'wc-alistando', array(
		'label'                     => 'Alistando',
		'public'                    => false,
		'exclude_from_search'       => false,
		'show_in_admin_all_list'    => true,
		'show_in_admin_status_list' => true,
		/* translators: %s: number of orders */
		'label_count'               => _n_noop( 'Alistando <span class="count">(%s)</span>', 'Alistando <span class="count">(%s)</span>', 'brk-operaciones' ),
	) );
	register_post_status( 'wc-enviado', array(
		'label'                     => 'Enviado',
		'public'                    => false,
		'exclude_from_search'       => false,
		'show_in_admin_all_list'    => true,
		'show_in_admin_status_list' => true,
		/* translators: %s: number of orders */
		'label_count'               => _n_noop( 'Enviado <span class="count">(%s)</span>', 'Enviados <span class="count">(%s)</span>', 'brk-operaciones' ),
	) );
} );

add_filter( 'wc_order_statuses', function ( $estados ) {
	$nuevos = array();
	foreach ( $estados as $k => $v ) {
		if ( 'wc-processing' === $k ) {
			$v = 'Recibido';
		}
		if ( 'wc-completed' === $k ) {
			$v = 'Entregado';
		}
		$nuevos[ $k ] = $v;
		if ( 'wc-processing' === $k ) {
			$nuevos['wc-alistando'] = 'Alistando';
			$nuevos['wc-enviado']   = 'Enviado';
		}
	}
	return $nuevos;
} );

// Los nuevos estados cuentan como pagados (reportes, descargas, inventario).
add_filter( 'woocommerce_order_is_paid_statuses', function ( $s ) {
	return array_merge( $s, array( 'alistando', 'enviado' ) );
} );
add_filter( 'woocommerce_reports_order_statuses', function ( $s ) {
	return is_array( $s ) ? array_merge( $s, array( 'alistando', 'enviado' ) ) : $s;
} );
// Acciones masivas en la lista estándar de pedidos.
foreach ( array( 'bulk_actions-edit-shop_order', 'bulk_actions-woocommerce_page_wc-orders' ) as $brk_hook ) {
	add_filter( $brk_hook, function ( $acciones ) {
		$acciones['mark_alistando'] = 'Cambiar estado a Alistando';
		$acciones['mark_enviado']   = 'Cambiar estado a Enviado';
		return $acciones;
	} );
}

/** Historial: guarda cuándo entró el pedido a cada estado (para la línea de tiempo del cliente). */
add_action( 'woocommerce_order_status_changed', function ( $order_id, $desde, $hacia, $order ) {
	if ( ! $order instanceof WC_Order ) {
		$order = wc_get_order( $order_id );
	}
	if ( ! $order ) {
		return;
	}
	$h = (array) $order->get_meta( '_brk_historial' );
	$h[ $hacia ] = time();
	$order->update_meta_data( '_brk_historial', $h );
	$order->save_meta_data();

	if ( in_array( $hacia, array( 'alistando', 'enviado' ), true ) ) {
		brk_enviar_correo_estado( $order, $hacia );
	}
}, 10, 4 );

/** Cambia el estado y, si es "enviado", guarda transportadora y guía. */
function brk_cambiar_estado( $order, $estado, $transportadora = '', $guia = '' ) {
	if ( 'enviado' === $estado ) {
		if ( $transportadora ) {
			$order->update_meta_data( '_brk_transportadora', sanitize_text_field( $transportadora ) );
		}
		if ( $guia ) {
			$order->update_meta_data( '_brk_guia', sanitize_text_field( $guia ) );
		}
		$order->save_meta_data();
	}
	$nota = '';
	if ( 'enviado' === $estado && $guia ) {
		$nota = sprintf( 'Enviado por %s, guía %s.', $transportadora ? $transportadora : 'transportadora', $guia );
	}
	$order->update_status( $estado, $nota, true );
}

function brk_enviar_correo_estado( $order, $estado ) {
	$correo = $order->get_billing_email();
	if ( ! $correo || ! function_exists( 'WC' ) ) {
		return;
	}
	$nombre = $order->get_billing_first_name();
	$num    = $order->get_order_number();
	$url    = $order->get_view_order_url();
	if ( 'alistando' === $estado ) {
		$asunto = sprintf( 'Estamos alistando tu pedido #%s', $num );
		$titulo = 'Estamos alistando tu pedido';
		$texto  = sprintf( 'Hola %s, tu pedido #%s ya está en bodega y lo estamos alistando. Te avisaremos cuando salga con la transportadora.', esc_html( $nombre ), esc_html( $num ) );
	} else {
		$asunto = sprintf( 'Tu pedido #%s va en camino', $num );
		$titulo = 'Tu pedido va en camino';
		$t      = $order->get_meta( '_brk_transportadora' );
		$g      = $order->get_meta( '_brk_guia' );
		$texto  = sprintf( 'Hola %s, tu pedido #%s ya fue despachado.', esc_html( $nombre ), esc_html( $num ) );
		if ( $g ) {
			$texto .= sprintf( '<br><br><strong>Transportadora:</strong> %s<br><strong>Número de guía:</strong> %s', esc_html( $t ), esc_html( $g ) );
		}
	}
	$texto .= sprintf( '<br><br><a href="%s">Ver el seguimiento de mi pedido</a>', esc_url( $url ) );
	$mailer = WC()->mailer();
	$html   = $mailer->wrap_message( $titulo, '<p>' . $texto . '</p>' );
	$mailer->send( $correo, $asunto, $html, array( 'Content-Type: text/html; charset=UTF-8' ) );
}
