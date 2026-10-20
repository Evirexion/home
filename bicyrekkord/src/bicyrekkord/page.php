<?php
defined( 'ABSPATH' ) || exit;
get_header();
$woo_page = function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() );
while ( have_posts() ) :
	the_post();
	?>
	<main class="brk-pagina<?php echo $woo_page ? ' brk-pagina--woo' : ''; ?>">
		<section class="brk-banda brk-banda--corta">
			<div class="brk-lineas" aria-hidden="true"></div>
			<div class="brk-wrap"><h1 class="brk-disp brk-banda__h1"><?php the_title(); ?></h1></div>
		</section>
		<div class="brk-wrap brk-pagina__cuerpo">
			<div class="brk-contenido-texto<?php echo $woo_page ? ' brk-contenido-texto--ancho' : ''; ?>">
				<?php the_content(); ?>
			</div>
		</div>
	</main>
	<?php
endwhile;
get_footer();
