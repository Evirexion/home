<?php
/**
 * Plantilla de tienda, categorías y fichas de producto.
 */
defined( 'ABSPATH' ) || exit;
get_header();
$es_producto = is_product();
?>
<main class="brk-woo<?php echo $es_producto ? ' brk-woo--producto' : ''; ?>">
	<?php if ( ! $es_producto ) : ?>
	<section class="brk-banda">
		<div class="brk-lineas" aria-hidden="true"></div>
		<div class="brk-wrap">
			<?php woocommerce_breadcrumb( array( 'delimiter' => ' / ' ) ); ?>
			<h1 class="brk-disp brk-banda__h1"><?php woocommerce_page_title(); ?></h1>
		</div>
	</section>
	<?php endif; ?>
	<div class="brk-wrap brk-woo__cuerpo">
		<?php
		if ( $es_producto ) {
			woocommerce_breadcrumb( array( 'delimiter' => ' / ' ) );
		}
		if ( ! $es_producto && ( is_shop() || is_product_taxonomy() ) ) :
			$actual = is_product_category() ? get_queried_object_id() : 0;
			$cats   = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0, 'exclude' => array( (int) get_option( 'default_product_cat' ) ) ) );
			?>
			<div class="brk-tienda">
				<aside class="brk-tienda__side" aria-label="<?php esc_attr_e( 'Categorías', 'bicyrekkord' ); ?>">
					<form role="search" method="get" class="brk-buscador" action="<?php echo esc_url( home_url( '/' ) ); ?>">
						<label class="screen-reader-text" for="brk-s"><?php esc_html_e( 'Buscar productos', 'bicyrekkord' ); ?></label>
						<?php echo brk_icono( 'buscar', 18 ); // phpcs:ignore ?>
						<input type="search" id="brk-s" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Buscar por nombre o SKU', 'bicyrekkord' ); ?>">
						<input type="hidden" name="post_type" value="product">
					</form>
					<div class="brk-eyebrow"><?php esc_html_e( 'Categorías', 'bicyrekkord' ); ?></div>
					<nav class="brk-chips">
						<a class="brk-chip<?php echo is_shop() && ! is_search() ? ' is-on' : ''; ?>" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Todas las categorías', 'bicyrekkord' ); ?></a>
						<?php if ( $cats && ! is_wp_error( $cats ) ) : foreach ( $cats as $c ) : ?>
							<a class="brk-chip<?php echo $actual === $c->term_id ? ' is-on' : ''; ?>" href="<?php echo esc_url( get_term_link( $c ) ); ?>" <?php echo $actual === $c->term_id ? 'aria-current="page"' : ''; ?>><?php echo esc_html( $c->name ); ?> <small><?php echo (int) $c->count; ?></small></a>
						<?php endforeach; endif; ?>
					</nav>
				</aside>
				<div class="brk-tienda__main">
					<?php woocommerce_content(); ?>
				</div>
			</div>
		<?php else : ?>
			<?php woocommerce_content(); ?>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
