<?php
/**
 * Portada de Bicyrekkord.
 */
defined( 'ABSPATH' ) || exit;
get_header();

$hero_img   = brk_mod( 'brk_hero_img' ) ? brk_mod( 'brk_hero_img' ) : brk_img( 'ricardo.webp' );
$hero_video = brk_mod( 'brk_hero_video' );
$tienda     = class_exists( 'WooCommerce' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/tienda/' );
$conteo     = wp_count_posts( 'product' );
$n_prod     = isset( $conteo->publish ) ? (int) $conteo->publish : 0;
?>
<main class="brk-home">

	<section class="brk-hero">
		<div class="brk-lineas" aria-hidden="true"></div>
		<div class="brk-wrap brk-hero__grid">
			<div class="brk-hero__visual">
				<svg class="brk-hero__ring" aria-hidden="true" viewBox="0 0 600 600">
					<circle cx="300" cy="300" r="250" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="18"/>
					<circle class="brk-ring-charge" cx="300" cy="300" r="250" fill="none" stroke="#00BF1A" stroke-width="18" stroke-linecap="round" transform="rotate(-90 300 300)"/>
					<circle class="brk-ring-spark" cx="300" cy="300" r="250" fill="none" stroke="#E9FFEC" stroke-width="10" stroke-linecap="round" transform="rotate(-90 300 300)"/>
					<polyline class="brk-bolt" points="548,170 572,150 560,182 590,166" fill="none" stroke="#7CFF8A" stroke-width="4" stroke-linejoin="round"/>
					<polyline class="brk-bolt b2" points="40,240 14,226 32,258 4,250" fill="none" stroke="#7CFF8A" stroke-width="4" stroke-linejoin="round"/>
					<polyline class="brk-bolt b3" points="470,500 500,516 474,530 506,548" fill="none" stroke="#7CFF8A" stroke-width="4" stroke-linejoin="round"/>
				</svg>
				<div class="brk-hero__carga">
					<?php echo brk_icono( 'rayo', 16 ); // phpcs:ignore ?>
					<div><small><?php esc_html_e( 'CARGA', 'bicyrekkord' ); ?></small><b class="brk-disp"><span id="brk-carga-num">0</span>%</b></div>
				</div>
				<?php if ( $hero_video ) : ?>
					<video class="brk-hero__media" src="<?php echo esc_url( $hero_video ); ?>" autoplay muted loop playsinline poster="<?php echo esc_url( $hero_img ); ?>"></video>
				<?php else : ?>
					<img class="brk-hero__media" src="<?php echo esc_url( $hero_img ); ?>" alt="<?php esc_attr_e( 'Ricardo Henao con la camiseta de Bicyrekkord', 'bicyrekkord' ); ?>" width="781" height="761" fetchpriority="high">
				<?php endif; ?>
			</div>
			<div class="brk-hero__texto">
				<div class="brk-eyebrow brk-eyebrow--linea"><?php echo esc_html( brk_mod( 'brk_hero_eyebrow' ) ); ?></div>
				<h1 class="brk-disp brk-hero__h1"><span><?php echo esc_html( brk_mod( 'brk_hero_t1' ) ); ?></span><span class="brk-verde"><?php echo esc_html( brk_mod( 'brk_hero_t2' ) ); ?></span></h1>
				<p class="brk-hero__lead"><?php echo esc_html( brk_mod( 'brk_hero_texto' ) ); ?></p>
				<div class="brk-hero__ctas">
					<a class="brk-btn brk-btn--verde brk-volt is-live" href="<?php echo esc_url( $tienda ); ?>"><?php esc_html_e( 'Ver tienda', 'bicyrekkord' ); ?> <?php echo brk_icono( 'flecha', 18 ); // phpcs:ignore ?></a>
					<a class="brk-btn brk-btn--linea" href="<?php echo esc_url( home_url( '/eres-en-taller/' ) ); ?>"><?php esc_html_e( '¿Eres taller?', 'bicyrekkord' ); ?></a>
				</div>
				<dl class="brk-stats">
					<div><dt class="brk-disp">2012</dt><dd><?php esc_html_e( 'Líderes desde', 'bicyrekkord' ); ?></dd></div>
					<?php if ( $n_prod >= 100 ) : ?>
					<div><dt class="brk-disp">+<?php echo esc_html( floor( $n_prod / 100 ) * 100 ); ?></dt><dd><?php esc_html_e( 'Referencias en catálogo', 'bicyrekkord' ); ?></dd></div>
					<?php endif; ?>
					<div><dt class="brk-disp"><?php esc_html_e( 'Envíos', 'bicyrekkord' ); ?></dt><dd><?php esc_html_e( 'A nivel nacional y global', 'bicyrekkord' ); ?></dd></div>
				</dl>
			</div>
		</div>
	</section>

	<section class="brk-marq" aria-label="<?php esc_attr_e( 'Categorías', 'bicyrekkord' ); ?>">
		<div class="brk-marq__track">
			<?php
			$palabras = array_filter( array_map( 'trim', explode( ',', brk_mod( 'brk_marquee' ) ) ) );
			$todas    = array_merge( $palabras, $palabras );
			foreach ( $todas as $i => $w ) {
				printf( '<span class="brk-disp%s"%s>%s%s</span>', $i % 2 ? ' brk-outline' : '', $i >= count( $palabras ) ? ' aria-hidden="true"' : '', esc_html( $w ), brk_icono( 'rayo', 26 ) ); // phpcs:ignore
			}
			?>
		</div>
	</section>

	<?php
	$cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0, 'exclude' => array( (int) get_option( 'default_product_cat' ) ) ) );
	if ( $cats && ! is_wp_error( $cats ) ) :
		?>
	<section class="brk-sec brk-sec--claro">
		<div class="brk-wrap">
			<div class="brk-sec__head">
				<div>
					<div class="brk-eyebrow brk-verde-osc"><?php esc_html_e( 'Categorías', 'bicyrekkord' ); ?></div>
					<h2 class="brk-disp brk-h2"><?php esc_html_e( 'Encuentra tu repuesto', 'bicyrekkord' ); ?></h2>
					<p><?php esc_html_e( 'Todas las categorías en un solo lugar para mantener tu vehículo eléctrico en movimiento.', 'bicyrekkord' ); ?></p>
				</div>
				<a class="brk-btn brk-btn--negro" href="<?php echo esc_url( $tienda ); ?>"><?php esc_html_e( 'Ver todo', 'bicyrekkord' ); ?></a>
			</div>
			<div class="brk-cats">
				<?php
				foreach ( $cats as $c ) :
					$thumb = get_term_meta( $c->term_id, 'thumbnail_id', true );
					$src   = $thumb ? wp_get_attachment_image_url( $thumb, 'woocommerce_thumbnail' ) : '';
					if ( ! $src ) {
						$p = wc_get_products( array( 'category' => array( $c->slug ), 'limit' => 1, 'status' => 'publish' ) );
						$src = $p ? wp_get_attachment_image_url( $p[0]->get_image_id(), 'woocommerce_thumbnail' ) : '';
					}
					?>
					<a class="brk-cat brk-volt" href="<?php echo esc_url( get_term_link( $c ) ); ?>">
						<span class="brk-cat__img"><?php if ( $src ) : ?><img src="<?php echo esc_url( $src ); ?>" alt="" loading="lazy"><?php endif; ?></span>
						<span class="brk-cat__txt"><?php echo esc_html( $c->name ); ?> <?php echo brk_icono( 'flecha', 18 ); // phpcs:ignore ?></span>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
	<?php endif; ?>

	<?php
	$motores = class_exists( 'WooCommerce' ) ? wc_get_products( array( 'category' => array( 'motor-y-componentes' ), 'limit' => 4, 'status' => 'publish' ) ) : array();
	?>
	<section class="brk-sec brk-motor">
		<div class="brk-wrap brk-motor__grid">
			<div class="brk-rueda" aria-hidden="true">
				<svg class="brk-rueda__gauge" viewBox="0 0 400 400">
					<circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/>
					<circle id="brk-gauge" cx="200" cy="200" r="196" fill="none" stroke="#00BF1A" stroke-width="4" stroke-linecap="round" stroke-dasharray="1232" stroke-dashoffset="1232" transform="rotate(135 200 200)"/>
				</svg>
				<div class="brk-rueda__idle"><div id="brk-rueda">
					<svg viewBox="0 0 400 400">
						<circle cx="200" cy="200" r="178" fill="none" stroke="#1B1F1C" stroke-width="40"/>
						<circle cx="200" cy="200" r="178" fill="none" stroke="#2A302C" stroke-width="36" stroke-dasharray="10 14"/>
						<circle cx="200" cy="200" r="150" fill="none" stroke="#3A423D" stroke-width="10"/>
						<circle cx="200" cy="200" r="140" fill="none" stroke="#00BF1A" stroke-width="3" stroke-dasharray="40 30"/>
						<g stroke="#4A544D" stroke-width="16" stroke-linecap="round"><line x1="200" y1="200" x2="200" y2="58"/><line x1="200" y1="200" x2="335" y2="156"/><line x1="200" y1="200" x2="283" y2="315"/><line x1="200" y1="200" x2="117" y2="315"/><line x1="200" y1="200" x2="65" y2="156"/></g>
						<circle cx="200" cy="200" r="74" fill="#111412" stroke="#00BF1A" stroke-width="4"/>
						<text x="200" y="214" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-style="italic" font-weight="900" font-size="44" fill="#fff">BRK</text>
					</svg>
				</div></div>
				<div class="brk-rueda__vel"><b class="brk-disp" id="brk-vel">0</b><small><?php esc_html_e( 'Velocidad', 'bicyrekkord' ); ?></small></div>
			</div>
			<div class="brk-motor__txt">
				<div class="brk-eyebrow brk-verde"><?php esc_html_e( 'Motor y componentes', 'bicyrekkord' ); ?></div>
				<h2 class="brk-disp brk-h2"><?php esc_html_e( 'Potencia que te mueve', 'bicyrekkord' ); ?></h2>
				<p><?php esc_html_e( 'Motores, kits y componentes para bicicletas, motos y patinetas eléctricas. Baja por la página y mira cómo acelera la rueda.', 'bicyrekkord' ); ?></p>
				<?php if ( $motores ) : ?>
				<ul class="brk-motores">
					<?php foreach ( $motores as $m ) : ?>
						<li class="brk-volt">
							<a href="<?php echo esc_url( $m->get_permalink() ); ?>" class="brk-motores__img"><?php echo wp_kses_post( $m->get_image( 'woocommerce_gallery_thumbnail' ) ); ?></a>
							<div class="brk-motores__info">
								<a href="<?php echo esc_url( $m->get_permalink() ); ?>"><?php echo esc_html( $m->get_name() ); ?></a>
								<span class="brk-sku"><?php echo esc_html( $m->get_sku() ); ?></span>
							</div>
							<span class="brk-motores__precio"><?php echo wp_kses_post( $m->get_price_html() ); ?></span>
						</li>
					<?php endforeach; ?>
				</ul>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<?php
	if ( class_exists( 'WooCommerce' ) ) :
		$dest = wc_get_products( array( 'featured' => true, 'limit' => 8, 'status' => 'publish' ) );
		if ( count( $dest ) < 4 ) {
			$dest = wc_get_products( array( 'limit' => 8, 'status' => 'publish', 'orderby' => 'date' ) );
		}
		if ( $dest ) :
			?>
	<section class="brk-sec brk-sec--claro">
		<div class="brk-wrap">
			<div class="brk-sec__head">
				<div>
					<div class="brk-eyebrow brk-verde-osc"><?php esc_html_e( 'Catálogo BRK', 'bicyrekkord' ); ?></div>
					<h2 class="brk-disp brk-h2"><?php esc_html_e( 'Destacados', 'bicyrekkord' ); ?></h2>
				</div>
				<a class="brk-btn brk-btn--negro" href="<?php echo esc_url( $tienda ); ?>"><?php esc_html_e( 'Ver todo', 'bicyrekkord' ); ?></a>
			</div>
			<div class="woocommerce">
				<ul class="products columns-4">
					<?php
					foreach ( $dest as $p ) {
						$GLOBALS['post'] = get_post( $p->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
						setup_postdata( $GLOBALS['post'] );
						wc_get_template_part( 'content', 'product' );
					}
					wp_reset_postdata();
					?>
				</ul>
			</div>
		</div>
	</section>
			<?php
		endif;
	endif;
	?>

	<section class="brk-envio">
		<div class="brk-wrap brk-envio__row">
			<div>
				<div class="brk-disp brk-h2"><?php esc_html_e( 'Envío GRATIS', 'bicyrekkord' ); ?></div>
				<p>
				<?php
				/* translators: %s: minimum amount */
				printf( esc_html__( 'por compras a partir de %s', 'bicyrekkord' ), wp_kses_post( function_exists( 'wc_price' ) ? wc_price( (float) brk_mod( 'brk_envio_min' ) ) : brk_mod( 'brk_envio_min' ) ) );
				?>
				</p>
			</div>
			<div class="brk-envio__cta">
				<svg aria-hidden="true" width="150" height="64" viewBox="0 0 150 64"><rect x="2" y="2" width="134" height="60" rx="10" fill="none" stroke="#0B0D0C" stroke-width="4"/><rect x="138" y="20" width="10" height="24" rx="3" fill="#0B0D0C"/><rect x="10" y="10" width="26" height="44" rx="4" fill="#0B0D0C"/><rect x="41" y="10" width="26" height="44" rx="4" fill="#0B0D0C"/><rect x="72" y="10" width="26" height="44" rx="4" fill="#0B0D0C"/><rect class="brk-bolt" x="103" y="10" width="26" height="44" rx="4" fill="#0B0D0C"/></svg>
				<a class="brk-btn brk-btn--negro" href="<?php echo esc_url( $tienda ); ?>"><?php esc_html_e( 'Ver tienda', 'bicyrekkord' ); ?></a>
			</div>
		</div>
	</section>

	<section class="brk-sec brk-oscuro">
		<div class="brk-wrap brk-dos">
			<div class="brk-tarjeta brk-volt">
				<?php echo brk_icono( 'llave', 44 ); // phpcs:ignore ?>
				<h2 class="brk-disp"><?php esc_html_e( '¿Eres taller?', 'bicyrekkord' ); ?></h2>
				<p><?php esc_html_e( 'Crea la cuenta de tu taller, haz tus pedidos y sigue cada despacho desde tu cuenta.', 'bicyrekkord' ); ?></p>
				<div class="brk-tarjeta__ctas">
					<a class="brk-btn brk-btn--verde" href="<?php echo esc_url( class_exists( 'WooCommerce' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/mi-cuenta/' ) ); ?>"><?php esc_html_e( 'Crear cuenta de taller', 'bicyrekkord' ); ?></a>
					<a class="brk-btn brk-btn--linea" href="<?php echo esc_url( home_url( '/eres-en-taller/' ) ); ?>"><?php esc_html_e( 'Conocer más', 'bicyrekkord' ); ?></a>
				</div>
			</div>
			<div class="brk-tarjeta brk-volt">
				<?php echo brk_icono( 'pin', 44 ); // phpcs:ignore ?>
				<h2 class="brk-disp"><?php esc_html_e( 'Talleres autorizados', 'bicyrekkord' ); ?></h2>
				<p><?php esc_html_e( 'Encuentra un taller autorizado Bicyrekkord para mantenimiento, repuestos y diagnóstico.', 'bicyrekkord' ); ?></p>
				<div class="brk-tarjeta__ctas"><a class="brk-btn brk-btn--linea" href="<?php echo esc_url( home_url( '/talleres-autorizados/' ) ); ?>"><?php esc_html_e( 'Ver talleres', 'bicyrekkord' ); ?></a></div>
			</div>
		</div>
	</section>

	<section class="brk-oscuro brk-social">
		<div class="brk-wrap brk-social__row">
			<div>
				<div class="brk-eyebrow brk-verde"><?php esc_html_e( 'Síguenos', 'bicyrekkord' ); ?></div>
				<a class="brk-disp brk-h2 brk-social__handle" href="<?php echo esc_url( brk_mod( 'brk_instagram' ) ); ?>" target="_blank" rel="noopener">@bicyrekkord</a>
				<p><?php esc_html_e( 'Estamos como @bicyrekkord en todas las redes.', 'bicyrekkord' ); ?></p>
			</div>
		</div>
	</section>
</main>
<?php
get_footer();
