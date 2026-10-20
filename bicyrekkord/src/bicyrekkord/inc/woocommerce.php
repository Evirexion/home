<?php
/**
 * Ajustes de WooCommerce para el tema.
 */
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
add_filter( 'loop_shop_per_page', function () {
	return 24;
} );
add_filter( 'loop_shop_columns', function () {
	return 4;
} );

// SKU encima del nombre en las tarjetas de producto.
add_action( 'woocommerce_shop_loop_item_title', function () {
	global $product;
	if ( $product && $product->get_sku() ) {
		echo '<span class="brk-sku">' . esc_html( $product->get_sku() ) . '</span>';
	}
}, 5 );

add_filter( 'woocommerce_product_add_to_cart_text', function ( $t, $product ) {
	return $product->is_purchasable() && $product->is_in_stock() && $product->is_type( 'simple' ) ? __( 'Agregar', 'bicyrekkord' ) : $t;
}, 10, 2 );

/** Contador del carrito en el encabezado (se actualiza por AJAX). */
function brk_cart_badge() {
	$n = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	return '<span class="brk-badge-cart"' . ( $n ? '' : ' hidden' ) . '>' . (int) $n . '</span>';
}
add_filter( 'woocommerce_add_to_cart_fragments', function ( $f ) {
	$f['span.brk-badge-cart'] = brk_cart_badge();
	$f['div.brk-envio-barra'] = brk_envio_barra();
	return $f;
} );

/** Barra tipo batería: cuánto falta para el envío gratis. */
function brk_envio_barra() {
	$min = (float) brk_mod( 'brk_envio_min' );
	if ( $min <= 0 || ! WC()->cart ) {
		return '<div class="brk-envio-barra" hidden></div>';
	}
	$sub = (float) WC()->cart->get_displayed_subtotal();
	$pct = min( 100, round( $sub / $min * 100 ) );
	$msg = $sub >= $min
		? __( '¡Tienes envío GRATIS!', 'bicyrekkord' )
		/* translators: %s: amount */
		: sprintf( __( 'Te faltan %s para envío GRATIS', 'bicyrekkord' ), wp_strip_all_tags( wc_price( $min - $sub ) ) );
	return '<div class="brk-envio-barra"><div class="brk-envio-barra__txt">' . esc_html( $msg ) . '</div><div class="brk-batt" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' . (int) $pct . '"><i style="width:' . (int) $pct . '%"></i></div></div>';
}
add_action( 'woocommerce_single_product_summary', function () {
	echo brk_envio_barra(); // phpcs:ignore WordPress.Security.EscapeOutput
}, 35 );
add_action( 'woocommerce_before_cart', function () {
	echo brk_envio_barra(); // phpcs:ignore WordPress.Security.EscapeOutput
}, 5 );
add_action( 'woocommerce_before_checkout_form', function () {
	echo brk_envio_barra(); // phpcs:ignore WordPress.Security.EscapeOutput
}, 5 );

// Productos relacionados: 4.
add_filter( 'woocommerce_output_related_products_args', function ( $a ) {
	$a['posts_per_page'] = 4;
	$a['columns']        = 4;
	return $a;
} );

// El título ya aparece en la banda negra superior.
add_filter( 'woocommerce_show_page_title', '__return_false' );
