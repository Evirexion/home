<?php
/**
 * Mi cuenta: historial de pedidos con seguimiento (Recibido → Alistando → Enviado → Entregado).
 */
defined( 'ABSPATH' ) || exit;

function brk_html_seguimiento( $order, $compacto = false ) {
	$estado = $order->get_status();
	$paso   = brk_paso( $estado );
	if ( $paso < 0 ) {
		$etiq = wc_get_order_status_name( $estado );
		return '<div class="brk-track brk-track--fuera"><p>Estado del pedido: <strong>' . esc_html( $etiq ) . '</strong></p></div>';
	}
	$h      = (array) $order->get_meta( '_brk_historial' );
	$creado = $order->get_date_created() ? $order->get_date_created()->getTimestamp() : 0;
	$pasos  = array(
		array( 'Recibido', 'Recibimos tu pedido', $h['processing'] ?? $creado ),
		array( 'Alistando', 'Lo estamos preparando en bodega', $h['alistando'] ?? 0 ),
		array( 'Enviado', 'Va en camino con la transportadora', $h['enviado'] ?? 0 ),
		array( 'Entregado', 'Lo recibiste', $h['completed'] ?? 0 ),
	);
	if ( in_array( $estado, array( 'pending', 'on-hold' ), true ) ) {
		$pasos[0][1] = 'pending' === $estado ? 'Esperando la confirmación del pago' : 'Pedido en espera de confirmación';
	}
	$out = '<ol class="brk-track' . ( $compacto ? ' brk-track--mini' : '' ) . '" aria-label="Seguimiento del pedido">';
	foreach ( $pasos as $i => $p ) {
		$cls  = $i < $paso ? 'hecho' : ( $i === $paso ? 'actual' : 'pendiente' );
		$out .= '<li class="' . $cls . '"' . ( $i === $paso ? ' aria-current="step"' : '' ) . '><span class="brk-track__punto" aria-hidden="true"></span><span class="brk-track__txt"><strong>' . esc_html( $p[0] ) . '</strong>';
		if ( ! $compacto ) {
			$out .= '<small>' . esc_html( $p[1] ) . '</small>';
			if ( $p[2] && $i <= $paso ) {
				$out .= '<small class="brk-track__fecha">' . esc_html( wp_date( 'd M Y · g:i a', $p[2] ) ) . '</small>';
			}
		}
		$out .= '</span></li>';
	}
	$out .= '</ol>';
	$guia = $order->get_meta( '_brk_guia' );
	if ( $guia && ! $compacto ) {
		$out .= '<p class="brk-guia">Transportadora: <strong>' . esc_html( $order->get_meta( '_brk_transportadora' ) ) . '</strong> · Guía: <strong>' . esc_html( $guia ) . '</strong></p>';
	}
	return $out;
}

add_action( 'woocommerce_view_order', function ( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( $order ) {
		echo '<section class="brk-seguimiento"><h2>Seguimiento</h2>' . brk_html_seguimiento( $order ) . '</section>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
}, 5 );

add_action( 'woocommerce_thankyou', function ( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( $order ) {
		echo '<section class="brk-seguimiento"><h2>Seguimiento</h2>' . brk_html_seguimiento( $order ) . '<p class="brk-nota">Puedes ver el estado de este pedido cuando quieras en <a href="' . esc_url( wc_get_account_endpoint_url( 'orders' ) ) . '">Mi cuenta › Mis pedidos</a>.</p></section>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
}, 5 );

add_filter( 'woocommerce_account_menu_items', function ( $items ) {
	if ( isset( $items['orders'] ) ) {
		$items['orders'] = 'Mis pedidos';
	}
	return $items;
} );

add_filter( 'woocommerce_my_account_my_orders_columns', function ( $cols ) {
	$nuevo = array();
	foreach ( $cols as $k => $v ) {
		$nuevo[ $k ] = $v;
		if ( 'order-status' === $k ) {
			$nuevo['brk-guia'] = 'Guía';
		}
	}
	return $nuevo;
} );
add_action( 'woocommerce_my_account_my_orders_column_brk-guia', function ( $order ) {
	$g = $order->get_meta( '_brk_guia' );
	echo $g ? esc_html( $order->get_meta( '_brk_transportadora' ) . ' ' . $g ) : '—';
} );

add_action( 'woocommerce_account_dashboard', function () {
	$uid = get_current_user_id();
	if ( brk_es_taller( $uid ) ) {
		$estado = get_user_meta( $uid, 'brk_taller_estado', true );
		echo '<div class="brk-cuenta-tipo"><strong>Cuenta de taller</strong> · ' . esc_html( get_user_meta( $uid, 'brk_taller_nombre', true ) ) . '<br><small>' . ( 'en_base' === $estado ? 'Tu taller ya está en nuestra base de datos.' : 'Recibimos tus datos; nuestro equipo comercial validará tu taller.' ) . '</small></div>';
	}
	$ultimo = wc_get_orders( array( 'customer_id' => $uid, 'limit' => 1, 'orderby' => 'date', 'order' => 'DESC' ) );
	if ( $ultimo ) {
		$o = $ultimo[0];
		echo '<section class="brk-ultimo"><h2>Tu último pedido <a href="' . esc_url( $o->get_view_order_url() ) . '">#' . esc_html( $o->get_order_number() ) . '</a></h2>' . brk_html_seguimiento( $o ) . '</section>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
} );
