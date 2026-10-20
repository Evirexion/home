<?php
/**
 * Tema Bicyrekkord 2026.
 */
defined( 'ABSPATH' ) || exit;

define( 'BRK_THEME_VERSION', '1.0.0' );

add_action( 'after_setup_theme', function () {
	load_theme_textdomain( 'bicyrekkord', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'custom-logo' );
	add_theme_support( 'woocommerce', array(
		'thumbnail_image_width' => 480,
		'single_image_width'    => 900,
		'product_grid'          => array( 'default_columns' => 4, 'default_rows' => 6 ),
	) );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
	register_nav_menus( array(
		'principal' => __( 'Menú principal', 'bicyrekkord' ),
		'legal'     => __( 'Políticas (pie de página)', 'bicyrekkord' ),
	) );
} );

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'brk-fonts', get_template_directory_uri() . '/assets/css/fonts.css', array(), BRK_THEME_VERSION );
	$deps = array( 'brk-fonts' );
	foreach ( array( 'woocommerce-general', 'woocommerce-layout', 'woocommerce-smallscreen', 'brk-ops' ) as $h ) {
		if ( wp_style_is( $h, 'registered' ) || wp_style_is( $h, 'enqueued' ) ) {
			$deps[] = $h;
		}
	}
	wp_enqueue_style( 'brk-theme', get_template_directory_uri() . '/assets/css/theme.css', $deps, BRK_THEME_VERSION );
	wp_enqueue_script( 'brk-theme', get_template_directory_uri() . '/assets/js/theme.js', array(), BRK_THEME_VERSION, true );
}, 20 );

add_action( 'wp_head', function () {
	$u = get_template_directory_uri() . '/assets/fonts/';
	echo '<link rel="preload" href="' . esc_url( $u . 'barlow-condensed-latin-900-italic.woff2' ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
	echo '<link rel="preload" href="' . esc_url( $u . 'montserrat-latin-600-normal.woff2' ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
}, 2 );

require get_template_directory() . '/inc/helpers.php';
require get_template_directory() . '/inc/customizer.php';
require get_template_directory() . '/inc/woocommerce.php';
