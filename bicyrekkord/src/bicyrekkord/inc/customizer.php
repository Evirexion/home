<?php
/**
 * Textos editables desde Apariencia › Personalizar › Bicyrekkord.
 * (Con WPML se traducen en WPML › Traducción de cadenas; ver wpml-config.xml.)
 */
defined( 'ABSPATH' ) || exit;

function brk_defaults() {
	return array(
		'brk_topbar'       => 'Envío GRATIS por compras a partir de $99.900',
		'brk_topbar2'      => 'Envíos a nivel nacional y global',
		'brk_hero_eyebrow' => 'Líderes desde 2012 · Bogotá, Colombia',
		'brk_hero_t1'      => 'Tu movilidad',
		'brk_hero_t2'      => 'no se detiene',
		'brk_hero_texto'   => 'Repuestos para vehículos eléctricos de dos ruedas: motores, controladores, cargadores, frenos y mucho más. Envíos a nivel nacional y global.',
		'brk_hero_img'     => '',
		'brk_hero_video'   => '',
		'brk_marquee'      => 'Motores, Frenos, Amortiguadores, Llantas, Controladores, Cargadores, Aceleradores, Iluminación',
		'brk_envio_min'    => '99900',
		'brk_direccion'    => "Avenida Carrera 68 # 12-76\nBogotá D.C., Colombia",
		'brk_horario'      => "Lunes a viernes: 9:00 a.m. – 5:00 p.m.\nSábado: 9:00 a.m. – 12:00 m.\nCerrado domingos y festivos",
		'brk_telefonos'    => "321 249 7479\n601 777 1400",
		'brk_correo'       => 'contacto@bicyrekkord.com',
		'brk_instagram'    => 'https://www.instagram.com/bicyrekkord/',
		'brk_facebook'     => 'https://www.facebook.com/BicyRekkord',
		'brk_youtube'      => 'https://www.youtube.com/@Bicyrekkord',
		'brk_x'            => 'https://x.com/Bicyrekkord',
	);
}

function brk_mod( $k ) {
	$d = brk_defaults();
	$v = get_theme_mod( $k, $d[ $k ] ?? '' );
	return ( '' === $v || null === $v ) ? ( $d[ $k ] ?? '' ) : $v;
}

add_action( 'customize_register', function ( $wpc ) {
	$wpc->add_section( 'brk', array( 'title' => 'Bicyrekkord', 'priority' => 25 ) );
	$campos = array(
		'brk_topbar'       => array( 'Barra superior (texto principal)', 'text' ),
		'brk_topbar2'      => array( 'Barra superior (texto secundario)', 'text' ),
		'brk_hero_eyebrow' => array( 'Portada: línea pequeña', 'text' ),
		'brk_hero_t1'      => array( 'Portada: título línea 1', 'text' ),
		'brk_hero_t2'      => array( 'Portada: título línea 2 (verde)', 'text' ),
		'brk_hero_texto'   => array( 'Portada: texto', 'textarea' ),
		'brk_hero_video'   => array( 'Portada: video MP4 de Ricardo (URL, opcional — reemplaza la foto)', 'url' ),
		'brk_marquee'      => array( 'Franja animada (separadas por coma)', 'text' ),
		'brk_envio_min'    => array( 'Monto mínimo para envío gratis (solo número)', 'text' ),
		'brk_direccion'    => array( 'Dirección', 'textarea' ),
		'brk_horario'      => array( 'Horario', 'textarea' ),
		'brk_telefonos'    => array( 'Teléfonos (uno por línea)', 'textarea' ),
		'brk_correo'       => array( 'Correo de contacto', 'email' ),
		'brk_instagram'    => array( 'Instagram', 'url' ),
		'brk_facebook'     => array( 'Facebook', 'url' ),
		'brk_youtube'      => array( 'YouTube', 'url' ),
		'brk_x'            => array( 'X', 'url' ),
	);
	$d = brk_defaults();
	foreach ( $campos as $k => $c ) {
		$wpc->add_setting( $k, array(
			'default'           => $d[ $k ],
			'sanitize_callback' => 'url' === $c[1] ? 'esc_url_raw' : ( 'textarea' === $c[1] ? 'sanitize_textarea_field' : 'sanitize_text_field' ),
		) );
		$wpc->add_control( $k, array( 'label' => $c[0], 'section' => 'brk', 'type' => $c[1] ) );
	}
	$wpc->add_setting( 'brk_hero_img', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wpc->add_control( new WP_Customize_Image_Control( $wpc, 'brk_hero_img', array(
		'label'       => 'Portada: imagen de Ricardo (PNG/WebP sin fondo)',
		'description' => 'Si se deja vacía se usa la foto incluida en el tema.',
		'section'     => 'brk',
	) ) );
} );
