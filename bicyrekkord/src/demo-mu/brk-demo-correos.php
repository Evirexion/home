<?php
/**
 * SOLO SITIO DEMO: los correos no salen a internet; se guardan para poder verlos en
 * Pedidos BRK › Correos (demo). Así se puede revisar la solicitud a contabilidad.
 */
defined( 'ABSPATH' ) || exit;

add_filter( 'pre_wp_mail', function ( $null, $atts ) {
	$lista = get_option( 'brk_demo_correos', array() );
	array_unshift( $lista, array(
		'fecha'  => time(),
		'para'   => is_array( $atts['to'] ) ? implode( ', ', $atts['to'] ) : $atts['to'],
		'asunto' => $atts['subject'],
		'html'   => $atts['message'],
	) );
	update_option( 'brk_demo_correos', array_slice( $lista, 0, 30 ), false );
	return true;
}, 10, 2 );

add_action( 'admin_menu', function () {
	add_submenu_page( 'brk-pedidos', 'Correos (demo)', 'Correos (demo)', 'edit_shop_orders', 'brk-demo-correos', function () {
		$lista = get_option( 'brk_demo_correos', array() );
		$ver   = isset( $_GET['ver'] ) ? (int) $_GET['ver'] : -1; // phpcs:ignore
		echo '<div class="wrap"><h1>Correos enviados (sitio demo)</h1><p>En el sitio de demostración los correos no se envían de verdad: aquí puedes ver qué le llegaría a cada destinatario, por ejemplo la solicitud de factura electrónica a contabilidad.</p>';
		if ( ! $lista ) {
			echo '<p><em>Todavía no se ha enviado ningún correo. Haz una compra pidiendo factura electrónica o cambia el estado de un pedido.</em></p></div>';
			return;
		}
		echo '<table class="widefat striped"><thead><tr><th>Fecha</th><th>Para</th><th>Asunto</th><th></th></tr></thead><tbody>';
		foreach ( $lista as $i => $c ) {
			printf( '<tr><td>%s</td><td>%s</td><td>%s</td><td><a class="button" href="%s">Ver</a></td></tr>', esc_html( wp_date( 'd/m/Y H:i', $c['fecha'] ) ), esc_html( $c['para'] ), esc_html( $c['asunto'] ), esc_url( add_query_arg( 'ver', $i ) ) );
		}
		echo '</tbody></table>';
		if ( isset( $lista[ $ver ] ) ) {
			echo '<h2 style="margin-top:24px">' . esc_html( $lista[ $ver ]['asunto'] ) . '</h2><iframe sandbox="" style="width:100%;height:720px;background:#fff;border:1px solid #ddd;border-radius:8px" srcdoc="' . esc_attr( $lista[ $ver ]['html'] ) . '"></iframe>';
		}
		echo '</div>';
	} );
}, 30 );
