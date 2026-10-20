<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main class="brk-pagina">
	<section class="brk-banda brk-404">
		<div class="brk-lineas" aria-hidden="true"></div>
		<div class="brk-wrap">
			<p class="brk-disp brk-404__num">404</p>
			<h1 class="brk-disp brk-banda__h1"><?php esc_html_e( 'Esta página se quedó sin carga', 'bicyrekkord' ); ?></h1>
			<p><a class="brk-btn brk-btn--verde" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Volver al inicio', 'bicyrekkord' ); ?></a></p>
		</div>
	</section>
</main>
<?php
get_footer();
