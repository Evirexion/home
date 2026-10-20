<?php defined( 'ABSPATH' ) || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0B0D0C">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#contenido"><?php esc_html_e( 'Saltar al contenido', 'bicyrekkord' ); ?></a>

<div class="brk-topbar">
	<div class="brk-wrap">
		<?php echo brk_icono( 'rayo', 14 ); // phpcs:ignore ?>
		<span><?php echo esc_html( brk_mod( 'brk_topbar' ) ); ?></span>
		<span class="brk-desk" aria-hidden="true">|</span>
		<span class="brk-desk brk-topbar__2"><?php echo esc_html( brk_mod( 'brk_topbar2' ) ); ?></span>
	</div>
</div>

<header class="brk-header" id="brk-header">
	<div class="brk-wrap brk-header__row">
		<a class="brk-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Bicyrekkord — inicio', 'bicyrekkord' ); ?>">
			<?php brk_isotipo( 46 ); ?>
			<img src="<?php echo esc_url( brk_img( 'wordmark-light.svg' ) ); ?>" alt="" width="190" height="24">
		</a>
		<nav class="brk-nav" aria-label="<?php esc_attr_e( 'Principal', 'bicyrekkord' ); ?>" id="brk-nav">
			<?php
			wp_nav_menu( array(
				'theme_location' => 'principal',
				'container'      => false,
				'menu_class'     => 'brk-menu',
				'depth'          => 2,
				'fallback_cb'    => 'brk_menu_fallback',
			) );
			?>
			<div class="brk-nav__langs-movil"><?php brk_idiomas(); ?></div>
		</nav>
		<div class="brk-header__tools">
			<div class="brk-desk"><?php brk_idiomas(); ?></div>
			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a class="brk-iconbtn" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>" aria-label="<?php echo is_user_logged_in() ? esc_attr__( 'Mi cuenta', 'bicyrekkord' ) : esc_attr__( 'Ingresar o crear cuenta', 'bicyrekkord' ); ?>">
					<?php echo brk_icono( 'usuario' ); // phpcs:ignore ?>
				</a>
				<a class="brk-iconbtn" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="<?php esc_attr_e( 'Carrito', 'bicyrekkord' ); ?>">
					<?php echo brk_icono( 'carrito' ); // phpcs:ignore ?>
					<?php echo brk_cart_badge(); // phpcs:ignore ?>
				</a>
			<?php endif; ?>
			<button class="brk-iconbtn brk-movil" type="button" aria-controls="brk-nav" aria-expanded="false" id="brk-menu-btn">
				<span class="screen-reader-text"><?php esc_html_e( 'Menú', 'bicyrekkord' ); ?></span>
				<?php echo brk_icono( 'menu' ); // phpcs:ignore ?>
			</button>
		</div>
	</div>
	<div class="brk-carga" aria-hidden="true"><i id="brk-carga"></i></div>
</header>
<div id="contenido" class="brk-contenido">
