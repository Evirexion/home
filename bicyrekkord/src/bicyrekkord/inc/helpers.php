<?php
defined( 'ABSPATH' ) || exit;

/** Ruta del isotipo (K) del logo, usada en el encabezado animado. */
function brk_k_path() {
	return 'M627.7 453.8C653.3 421.8 686.0 379.3 685.8 378.4C685.5 377.1 628.1 307.2 625.8 305.2C624.8 304.5 620.4 306.6 609.0 313.2C600.5 318.2 593.3 322.4 593.1 322.6C592.9 322.8 589.7 335.5 586.0 350.7L579.2 378.5L531.1 378.8C492.2 379.0 483.0 378.8 483.0 377.7C483.0 376.6 500.3 305.7 547.7 113.2L559.3 66.0L607.7 66.0C653.4 66.0 656.1 66.1 655.6 67.8C655.1 69.5 628.7 177.5 618.9 218.0C616.2 229.3 613.7 239.2 613.4 240.0C613.0 241.2 613.1 241.3 614.2 240.2C614.9 239.5 630.1 219.5 648.0 195.7L680.5 152.5L755.0 152.3C796.0 152.1 835.2 152.4 842.2 152.8L855.0 153.5L843.2 162.5C823.7 177.4 714.7 261.1 711.3 263.9C709.5 265.3 708.0 266.9 708.0 267.3C708.0 267.8 713.3 274.5 719.8 282.3C765.4 337.1 799.2 378.2 798.9 378.5C798.7 378.6 773.8 389.8 743.5 403.3C713.2 416.8 675.7 433.5 660.0 440.5C626.6 455.4 626.3 455.5 627.7 453.8Z';
}

function brk_isotipo( $size = 46 ) {
	$d = brk_k_path();
	printf(
		'<svg class="brk-iso" aria-hidden="true" width="%1$d" height="%1$d" viewBox="440 50 440 420"><circle class="brk-iso__ring" cx="644.5" cy="266" r="184.5" fill="none" stroke="#00BF1A" stroke-width="20" transform="rotate(-90 644.5 266)"/><path d="%2$s" fill="#0B0D0C" stroke="#0B0D0C" stroke-width="26" stroke-linejoin="round"/><path d="%2$s" fill="#fff"/></svg>',
		(int) $size,
		esc_attr( $d )
	);
}

function brk_img( $file ) {
	return get_template_directory_uri() . '/assets/img/' . $file;
}

function brk_icono( $nombre, $size = 20 ) {
	$i = array(
		'rayo'     => '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="none"/>',
		'flecha'   => '<path d="M5 12h14M13 6l6 6-6 6"/>',
		'usuario'  => '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
		'carrito'  => '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/>',
		'menu'     => '<path d="M4 7h16M4 12h16M4 17h10"/>',
		'cerrar'   => '<path d="M6 6l12 12M18 6 6 18"/>',
		'llave'    => '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
		'pin'      => '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
		'instagram' => '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
		'facebook' => '<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5h2.7l.5-3.5h-3.2V7a1 1 0 0 1 1-1H15z"/>',
		'youtube'  => '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>',
		'x'        => '<path d="M4 4l16 16M20 4 4 20"/>',
		'buscar'   => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
	);
	return sprintf( '<svg aria-hidden="true" width="%1$d" height="%1$d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%2$s</svg>', (int) $size, $i[ $nombre ] ?? '' );
}

/** Selector de idioma: WPML o Polylang si están activos. */
function brk_idiomas() {
	$langs = array();
	if ( function_exists( 'icl_get_languages' ) ) {
		foreach ( (array) icl_get_languages( 'skip_missing=0&orderby=code' ) as $l ) {
			$langs[] = array( 'code' => strtoupper( $l['language_code'] ), 'url' => $l['url'], 'on' => ! empty( $l['active'] ) );
		}
	} elseif ( function_exists( 'pll_the_languages' ) ) {
		foreach ( (array) pll_the_languages( array( 'raw' => 1 ) ) as $l ) {
			$langs[] = array( 'code' => strtoupper( $l['slug'] ), 'url' => $l['url'], 'on' => ! empty( $l['current_lang'] ) );
		}
	}
	if ( count( $langs ) < 2 ) {
		return;
	}
	echo '<div class="brk-langs" role="group" aria-label="' . esc_attr__( 'Idioma', 'bicyrekkord' ) . '">';
	foreach ( $langs as $l ) {
		printf( '<a href="%s" class="%s" %s>%s</a>', esc_url( $l['url'] ), $l['on'] ? 'is-on' : '', $l['on'] ? 'aria-current="true"' : '', esc_html( $l['code'] ) );
	}
	echo '</div>';
}

function brk_menu_fallback() {
	$items = array(
		home_url( '/' )                     => __( 'Inicio', 'bicyrekkord' ),
		home_url( '/tienda/' )              => __( 'Tienda', 'bicyrekkord' ),
		home_url( '/eres-en-taller/' )      => __( '¿Eres taller?', 'bicyrekkord' ),
		home_url( '/talleres-autorizados/' ) => __( 'Talleres autorizados', 'bicyrekkord' ),
		home_url( '/blog/' )                => __( 'Blog', 'bicyrekkord' ),
		home_url( '/contactanos/' )         => __( 'Contáctanos', 'bicyrekkord' ),
	);
	echo '<ul class="brk-menu">';
	foreach ( $items as $u => $t ) {
		echo '<li><a href="' . esc_url( $u ) . '">' . esc_html( $t ) . '</a></li>';
	}
	echo '</ul>';
}
