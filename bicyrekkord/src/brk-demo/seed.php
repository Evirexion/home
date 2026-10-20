<?php
/**
 * Contenido de demostración para el sitio dev de Bicyrekkord.
 * Se ejecuta una vez (WP-CLI: wp eval-file seed.php, o desde el blueprint de Playground).
 * NO se instala en bicyrekkord.com: allá se usan los productos y páginas reales.
 */
defined( 'ABSPATH' ) || exit;

if ( get_option( 'brk_demo_seed' ) ) {
	return;
}
@set_time_limit( 600 ); // phpcs:ignore
$brk_dir = __DIR__;

// No enviar correos mientras se crean los datos de prueba.
add_filter( 'pre_wp_mail', '__return_true', 99 );

require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

// ---------- Ajustes generales ----------
update_option( 'blogname', 'Bicyrekkord' );
update_option( 'blogdescription', 'Repuestos para vehículos eléctricos de dos ruedas' );
update_option( 'timezone_string', 'America/Bogota' );
update_option( 'date_format', 'j \d\e F \d\e Y' );
update_option( 'permalink_structure', '/%postname%/' );
update_option( 'woocommerce_permalinks', array( 'product_base' => '/producto', 'category_base' => 'categoria-producto', 'tag_base' => 'etiqueta-producto', 'attribute_base' => '', 'use_verbose_page_rules' => false ) );
foreach ( array(
	'woocommerce_currency'               => 'COP',
	'woocommerce_currency_pos'           => 'left',
	'woocommerce_price_thousand_sep'     => '.',
	'woocommerce_price_decimal_sep'      => ',',
	'woocommerce_price_num_decimals'     => '0',
	'woocommerce_default_country'        => 'CO:CO-DC',
	'woocommerce_store_address'          => 'Avenida Carrera 68 # 12-76',
	'woocommerce_store_city'             => 'Bogotá',
	'woocommerce_calc_taxes'             => 'no',
	'woocommerce_coming_soon'            => 'no',
	'woocommerce_store_pages_only'       => 'no',
	'woocommerce_task_list_hidden'       => 'yes',
	'woocommerce_show_marketplace_suggestions' => 'no',
	'woocommerce_enable_myaccount_registration' => 'yes',
	'woocommerce_registration_generate_password' => 'no',
	'woocommerce_enable_guest_checkout'  => 'yes',
	'woocommerce_enable_checkout_login_reminder' => 'yes',
	'woocommerce_enable_signup_and_login_from_checkout' => 'yes',
	'woocommerce_email_from_name'        => 'Bicyrekkord',
	'woocommerce_email_from_address'     => 'contacto@bicyrekkord.com',
	'woocommerce_email_base_color'       => '#00BF1A',
	'woocommerce_email_header_image'     => '',
	'woocommerce_cart_redirect_after_add' => 'no',
	'woocommerce_enable_ajax_add_to_cart' => 'yes',
) as $k => $v ) {
	update_option( $k, $v );
}
update_option( 'woocommerce_onboarding_profile', array( 'skipped' => true ) );

// ---------- Categorías ----------
$cats = array(
	'aceleradores'                  => 'Aceleradores',
	'bombillos-y-flashers'          => 'Bombillos y flashers',
	'cables-y-conectores'           => 'Cables y conectores',
	'cargadores'                    => 'Cargadores',
	'baterias'                      => 'Baterías',
	'controladores-y-convertidores' => 'Controladores y convertidores',
	'corazas-y-neumaticos'          => 'Corazas y neumáticos',
	'motor-y-componentes'           => 'Motor y componentes',
	'sistema-de-frenado'            => 'Sistema de frenado',
	'miscelaneos'                   => 'Misceláneos',
);
$cat_ids = array();
$orden   = 0;
foreach ( $cats as $slug => $nombre ) {
	$t = get_term_by( 'slug', $slug, 'product_cat' );
	if ( ! $t ) {
		$r = wp_insert_term( $nombre, 'product_cat', array( 'slug' => $slug ) );
		$cat_ids[ $slug ] = is_wp_error( $r ) ? 0 : $r['term_id'];
	} else {
		$cat_ids[ $slug ] = $t->term_id;
	}
	update_term_meta( $cat_ids[ $slug ], 'order', $orden++ );
}

// ---------- Productos ----------
add_filter( 'intermediate_image_sizes_advanced', function ( $s ) {
	return array_intersect_key( $s, array_flip( array( 'thumbnail', 'woocommerce_thumbnail', 'woocommerce_gallery_thumbnail' ) ) );
} );
$uploads   = wp_upload_dir();
$destino   = trailingslashit( $uploads['basedir'] ) . 'brk-demo';
wp_mkdir_p( $destino );
$destacados = array( 'RKCT025', 'RKCG031', 'RKFR012', 'RKAC036', 'RKUL002', 'RKCZ026', 'RKGPS002', 'RKBA009' );
$prod_ids   = array();
$descripcion = '<p>[Aquí va la descripción actual de este producto en bicyrekkord.com. El contenido, el SKU y la URL se conservan tal cual: el tema nuevo solo cambia el diseño.]</p>';
foreach ( include $brk_dir . '/productos.php' as $row ) {
	list( $sku, $nombre, $precio, $cat ) = $row;
	$existente = wc_get_product_id_by_sku( $sku );
	$p         = $existente ? wc_get_product( $existente ) : new WC_Product_Simple();
	$p->set_name( $nombre );
	$p->set_sku( $sku );
	$p->set_regular_price( (string) $precio );
	$p->set_status( 'publish' );
	$p->set_catalog_visibility( 'visible' );
	$p->set_category_ids( array( $cat_ids[ $cat ] ) );
	$p->set_featured( in_array( $sku, $destacados, true ) );
	$p->set_description( $descripcion );
	$p->set_manage_stock( false );
	$p->set_stock_status( 'instock' );
	$origen = $brk_dir . '/img/' . $sku . '.webp';
	if ( ! $p->get_image_id() && file_exists( $origen ) ) {
		$archivo = $destino . '/' . $sku . '.webp';
		copy( $origen, $archivo );
		$att_id = wp_insert_attachment( array(
			'post_mime_type' => 'image/webp',
			'post_title'     => $nombre,
			'post_status'    => 'inherit',
		), $archivo );
		if ( $att_id && ! is_wp_error( $att_id ) ) {
			wp_update_attachment_metadata( $att_id, wp_generate_attachment_metadata( $att_id, $archivo ) );
			$p->set_image_id( $att_id );
		}
	}
	$prod_ids[ $sku ] = $p->save();
}

// ---------- Páginas ----------
function brk_demo_pagina( $slug, $titulo, $contenido, $padre = 0 ) {
	$pag = get_page_by_path( $slug );
	$datos = array( 'post_title' => $titulo, 'post_name' => $slug, 'post_content' => $contenido, 'post_status' => 'publish', 'post_type' => 'page', 'post_parent' => $padre );
	if ( $pag ) {
		$datos['ID'] = $pag->ID;
		return wp_update_post( $datos );
	}
	return wp_insert_post( $datos );
}
$placeholder = '<p>[Contenido actual de esta página en bicyrekkord.com. Se conserva tal cual al publicar el tema nuevo.]</p>';
$inicio   = brk_demo_pagina( 'inicio', 'Inicio', '' );
$blog     = brk_demo_pagina( 'blog', 'Blog', '' );
$tienda   = brk_demo_pagina( 'tienda', 'Tienda', '' );
$carrito  = brk_demo_pagina( 'carrito', 'Carrito', '<!-- wp:shortcode -->[woocommerce_cart]<!-- /wp:shortcode -->' );
$checkout = brk_demo_pagina( 'finalizar-compra', 'Finalizar compra', '<!-- wp:shortcode -->[woocommerce_checkout]<!-- /wp:shortcode -->' );
$cuenta   = brk_demo_pagina( 'mi-cuenta', 'Mi cuenta', '<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->' );
$taller   = brk_demo_pagina( 'eres-en-taller', '¿Eres taller?', '<p>Crea la cuenta de tu taller en <a href="/mi-cuenta/">Mi cuenta</a>: elige <strong>Taller</strong>. Si tu taller ya está en nuestra base de datos te reconocemos por tu correo o celular; si es nuevo, te pediremos el NIT o documento de identidad.</p>' . $placeholder );
$autoriz  = brk_demo_pagina( 'talleres-autorizados', 'Talleres autorizados', $placeholder );
$contacto = brk_demo_pagina( 'contactanos', 'Contáctanos', $placeholder );
$politicas = array(
	'politicas-de-envios'                     => 'Política de envíos',
	'politica-de-garantia'                    => 'Política de garantía',
	'politica-de-privacidad'                  => 'Política de privacidad',
	'politica-tratamiento-de-datos-personales' => 'Tratamiento de datos personales',
	'politica-de-devoluciones-y-reembolsos'   => 'Devoluciones y reembolsos',
);
$pol_ids = array();
foreach ( $politicas as $s => $t ) {
	$pol_ids[ $s ] = brk_demo_pagina( $s, $t, $placeholder );
}
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $inicio );
update_option( 'page_for_posts', $blog );
update_option( 'woocommerce_shop_page_id', $tienda );
update_option( 'woocommerce_cart_page_id', $carrito );
update_option( 'woocommerce_checkout_page_id', $checkout );
update_option( 'woocommerce_myaccount_page_id', $cuenta );
update_option( 'wp_page_for_privacy_policy', $pol_ids['politica-de-privacidad'] );
update_option( 'woocommerce_terms_page_id', 0 );
foreach ( get_posts( array( 'post_type' => 'page', 'name' => 'shop', 'numberposts' => 5 ) ) as $viejo ) {
	if ( (int) $viejo->ID !== (int) $tienda ) {
		wp_delete_post( $viejo->ID, true );
	}
}
foreach ( array( 'cart', 'checkout', 'my-account', 'sample-page', 'refund_returns' ) as $s ) {
	$v = get_page_by_path( $s );
	if ( $v && ! in_array( (int) $v->ID, array( $carrito, $checkout, $cuenta ), true ) ) {
		wp_delete_post( $v->ID, true );
	}
}
wp_delete_post( 1, true ); // "Hello world"

// Una entrada de blog de ejemplo.
if ( ! get_page_by_path( 'bienvenidos-a-la-nueva-tienda', OBJECT, 'post' ) ) {
	$post_id = wp_insert_post( array(
		'post_title'   => 'Bienvenidos a la nueva tienda',
		'post_name'    => 'bienvenidos-a-la-nueva-tienda',
		'post_content' => $placeholder,
		'post_status'  => 'publish',
	) );
	if ( ! empty( $prod_ids['RKMT031'] ) ) {
		set_post_thumbnail( $post_id, get_post_thumbnail_id( $prod_ids['RKMT031'] ) );
	}
}

// ---------- Menús ----------
function brk_demo_menu( $nombre, $ubicacion, $items ) {
	$m = wp_get_nav_menu_object( $nombre );
	$id = $m ? $m->term_id : wp_create_nav_menu( $nombre );
	foreach ( wp_get_nav_menu_items( $id ) ?: array() as $it ) {
		wp_delete_post( $it->ID, true );
	}
	foreach ( $items as $pid ) {
		wp_update_nav_menu_item( $id, 0, array( 'menu-item-object-id' => $pid, 'menu-item-object' => 'page', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish' ) );
	}
	$loc = get_theme_mod( 'nav_menu_locations', array() );
	$loc[ $ubicacion ] = $id;
	set_theme_mod( 'nav_menu_locations', $loc );
}
brk_demo_menu( 'Principal', 'principal', array( $inicio, $tienda, $taller, $autoriz, $blog, $contacto ) );
brk_demo_menu( 'Políticas', 'legal', array_values( $pol_ids ) );

// ---------- Envíos y pagos ----------
$zonas = WC_Shipping_Zones::get_zones();
if ( ! $zonas ) {
	$zona = new WC_Shipping_Zone();
	$zona->set_zone_name( 'Colombia' );
	$zona->add_location( 'CO', 'country' );
	$zona->save();
	$gratis = $zona->add_shipping_method( 'free_shipping' );
	update_option( 'woocommerce_free_shipping_' . $gratis . '_settings', array( 'title' => 'Envío GRATIS', 'requires' => 'min_amount', 'min_amount' => '99900', 'ignore_discounts' => 'no' ) );
	$flete = $zona->add_shipping_method( 'flat_rate' );
	update_option( 'woocommerce_flat_rate_' . $flete . '_settings', array( 'title' => 'Envío (el flete se paga contra entrega)', 'tax_status' => 'none', 'cost' => '0' ) );
}
update_option( 'woocommerce_cod_settings', array( 'enabled' => 'yes', 'title' => 'Pago contra entrega', 'description' => 'Pagas al recibir tu pedido.', 'instructions' => '', 'enable_for_methods' => array(), 'enable_for_virtual' => 'yes' ) );
update_option( 'woocommerce_bacs_settings', array( 'enabled' => 'yes', 'title' => 'Transferencia bancaria', 'description' => 'Te enviaremos los datos de la cuenta para hacer la transferencia.', 'instructions' => '' ) );

// ---------- Base de talleres (datos ficticios de demostración) ----------
BRK_Talleres::crear_tabla();
BRK_Talleres::guardar( array( 'nit' => '900111222-3', 'nombre' => 'Taller Demo Eléctricos (ficticio)', 'ciudad' => 'Bogotá', 'celular' => '3001112233', 'correo' => 'taller.demo@ejemplo.com' ) );
BRK_Talleres::guardar( array( 'nit' => '901222333-4', 'nombre' => 'Moto Taller Demo (ficticio)', 'ciudad' => 'Medellín', 'celular' => '3002223344', 'correo' => 'mototaller.demo@ejemplo.com' ) );

// ---------- Usuarios de demostración ----------
if ( ! get_role( 'taller' ) ) {
	add_role( 'taller', 'Taller', get_role( 'customer' )->capabilities );
}
function brk_demo_usuario( $correo, $nombre, $apellido, $rol, $metas ) {
	$u = get_user_by( 'email', $correo );
	$id = $u ? $u->ID : wp_insert_user( array( 'user_login' => strstr( $correo, '@', true ), 'user_email' => $correo, 'user_pass' => 'demo1234', 'first_name' => $nombre, 'last_name' => $apellido, 'display_name' => $nombre . ' ' . $apellido, 'role' => $rol ) );
	foreach ( $metas as $k => $v ) {
		update_user_meta( $id, $k, $v );
	}
	return $id;
}
$cli = brk_demo_usuario( 'cliente@demo.com', 'Cliente', 'Demo', 'customer', array( 'brk_tipo_cuenta' => 'cliente', 'billing_first_name' => 'Cliente', 'billing_last_name' => 'Demo', 'billing_phone' => '3000000001', 'billing_email' => 'cliente@demo.com', 'billing_address_1' => 'Calle 100 # 10-20', 'billing_city' => 'Bogotá', 'billing_state' => 'CO-DC', 'billing_country' => 'CO' ) );
$tal = brk_demo_usuario( 'taller@demo.com', 'Taller', 'Demo', 'taller', array( 'brk_tipo_cuenta' => 'taller', 'brk_taller_nombre' => 'Taller Demo Eléctricos (ficticio)', 'brk_taller_estado' => 'en_base', 'brk_doc_tipo' => 'NIT', 'brk_doc_numero' => '900111222-3', 'billing_first_name' => 'Taller', 'billing_last_name' => 'Demo', 'billing_company' => 'Taller Demo Eléctricos (ficticio)', 'billing_phone' => '3001112233', 'billing_email' => 'taller@demo.com', 'billing_address_1' => 'Carrera 30 # 45-10', 'billing_city' => 'Bogotá', 'billing_state' => 'CO-DC', 'billing_country' => 'CO' ) );

// ---------- Pedidos de demostración ----------
$pedidos = array(
	array( $cli, 'processing', array( 'RKCT030' => 1, 'RKXT001' => 2 ), 'no', 'Bogotá', 'DC', 0 ),
	array( $tal, 'processing', array( 'RKMT031' => 1, 'RKCT025' => 1 ), 'si', 'Bogotá', 'DC', 0 ),
	array( 0, 'processing', array( 'RKFR048' => 4, 'RKMF008' => 2 ), 'no', 'Medellín', 'ANT', 1 ),
	array( 0, 'processing', array( 'RKCG051' => 1 ), 'si', 'Cali', 'VAC', 2 ),
	array( $tal, 'alistando', array( 'RKCZ019' => 4, 'RKRN006' => 2 ), 'si', 'Bogotá', 'DC', 3 ),
	array( 0, 'alistando', array( 'RKGPS002' => 1, 'RKLA001' => 1 ), 'no', 'Barranquilla', 'ATL', 4 ),
	array( $cli, 'enviado', array( 'RKAC036' => 1, 'RKCS002' => 1 ), 'no', 'Bogotá', 'DC', 5 ),
	array( 0, 'completed', array( 'RKBA009' => 1 ), 'no', 'Bucaramanga', 'SAN', 6 ),
	array( 0, 'on-hold', array( 'RKCG031' => 1 ), 'no', 'Pereira', 'RIS', 7 ),
);
$invitados = array(
	array( 'Laura', 'Gómez' ), array( 'Andrés', 'Rojas' ), array( 'Camila', 'Torres' ), array( 'Julián', 'Martínez' ),
	array( 'Valentina', 'Ríos' ), array( 'Santiago', 'López' ), array( 'Daniela', 'Castro' ), array( 'Felipe', 'Moreno' ),
);
$hace = 9;
foreach ( $pedidos as $i => $pd ) {
	list( $uid, $estado, $items, $fe, $ciudad, $depto, $inv ) = $pd;
	$o = wc_create_order( array( 'customer_id' => $uid ) );
	foreach ( $items as $sku => $q ) {
		$o->add_product( wc_get_product( $prod_ids[ $sku ] ), $q );
	}
	if ( $uid ) {
		$u = get_userdata( $uid );
		$nom = array( get_user_meta( $uid, 'billing_first_name', true ), get_user_meta( $uid, 'billing_last_name', true ) );
		$correo = $u->user_email;
		$tel = get_user_meta( $uid, 'billing_phone', true );
	} else {
		$nom = $invitados[ $inv ];
		$correo = strtolower( remove_accents( $nom[0] ) ) . '.' . ( $i + 1 ) . '@demo.com';
		$tel = '30000000' . str_pad( (string) ( $i + 10 ), 2, '0', STR_PAD_LEFT );
	}
	$dir = array( 'first_name' => $nom[0], 'last_name' => $nom[1], 'email' => $correo, 'phone' => $tel, 'address_1' => 'Dirección de prueba ' . ( $i + 1 ), 'city' => $ciudad, 'state' => 'CO-' . $depto, 'country' => 'CO' );
	$o->set_address( $dir, 'billing' );
	$o->set_address( $dir, 'shipping' );
	$o->set_payment_method( 0 === $i % 3 ? 'bacs' : 'cod' );
	$o->set_payment_method_title( 0 === $i % 3 ? 'Transferencia bancaria' : 'Pago contra entrega' );
	$rate = new WC_Shipping_Rate( 'free_shipping:1', 'Envío GRATIS', 0, array(), 'free_shipping' );
	$item = new WC_Order_Item_Shipping();
	$item->set_shipping_rate( $rate );
	$o->add_item( $item );
	$o->update_meta_data( '_brk_fe', $fe );
	if ( 'si' === $fe ) {
		$o->update_meta_data( '_brk_fe_doc_tipo', $uid === $tal ? 'NIT' : 'CC' );
		$o->update_meta_data( '_brk_fe_doc_num', $uid === $tal ? '900111222-3' : '1020304050' );
		$o->update_meta_data( '_brk_fe_razon', $uid === $tal ? 'Taller Demo Eléctricos (ficticio)' : $nom[0] . ' ' . $nom[1] );
		$o->update_meta_data( '_brk_fe_correo', $correo );
		$o->update_meta_data( '_brk_fe_enviada', time() - $hace * 3600 );
	}
	$o->calculate_totals();
	$fecha = time() - $hace * 3600 * 5;
	$o->set_date_created( $fecha );
	$hist = array( 'processing' => $fecha );
	if ( in_array( $estado, array( 'alistando', 'enviado', 'completed' ), true ) ) {
		$hist['alistando'] = $fecha + 3600 * 3;
	}
	if ( in_array( $estado, array( 'enviado', 'completed' ), true ) ) {
		$hist['enviado'] = $fecha + 3600 * 20;
		$o->update_meta_data( '_brk_transportadora', 'Servientrega' );
		$o->update_meta_data( '_brk_guia', '20' . str_pad( (string) ( 4815162 + $i ), 8, '0', STR_PAD_LEFT ) );
	}
	if ( 'completed' === $estado ) {
		$hist['completed'] = $fecha + 3600 * 44;
	}
	$o->update_meta_data( '_brk_historial', $hist );
	$o->set_status( $estado );
	$o->save();
	// El cambio de estado registra "ahora"; se restauran las fechas simuladas.
	$o->update_meta_data( '_brk_historial', $hist );
	$o->save_meta_data();
	$hace--;
}

// Las reglas se regeneran en la próxima visita, ya con la base /producto/.
delete_option( 'rewrite_rules' );
update_option( 'brk_demo_seed', time() );
remove_filter( 'pre_wp_mail', '__return_true', 99 );
