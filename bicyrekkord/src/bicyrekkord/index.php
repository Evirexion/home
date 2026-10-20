<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main class="brk-pagina">
	<section class="brk-banda brk-banda--corta">
		<div class="brk-lineas" aria-hidden="true"></div>
		<div class="brk-wrap"><h1 class="brk-disp brk-banda__h1">
		<?php
		if ( is_home() ) {
			esc_html_e( 'Blog', 'bicyrekkord' );
		} elseif ( is_search() ) {
			/* translators: %s: search term */
			printf( esc_html__( 'Resultados para «%s»', 'bicyrekkord' ), esc_html( get_search_query() ) );
		} elseif ( is_singular() ) {
			single_post_title();
		} else {
			the_archive_title();
		}
		?>
		</h1></div>
	</section>
	<div class="brk-wrap brk-pagina__cuerpo">
		<?php if ( is_singular() ) : ?>
			<?php while ( have_posts() ) : the_post(); ?>
				<article <?php post_class( 'brk-contenido-texto' ); ?>>
					<p class="brk-meta"><?php echo esc_html( get_the_date() ); ?></p>
					<?php if ( has_post_thumbnail() ) { the_post_thumbnail( 'large', array( 'class' => 'brk-portada-post' ) ); } ?>
					<?php the_content(); ?>
				</article>
			<?php endwhile; ?>
		<?php elseif ( have_posts() ) : ?>
			<div class="brk-posts">
				<?php while ( have_posts() ) : the_post(); ?>
					<article <?php post_class( 'brk-post brk-volt' ); ?>>
						<a href="<?php the_permalink(); ?>" class="brk-post__img"><?php if ( has_post_thumbnail() ) { the_post_thumbnail( 'medium_large' ); } ?></a>
						<div class="brk-post__txt">
							<p class="brk-meta"><?php echo esc_html( get_the_date() ); ?></p>
							<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
							<?php the_excerpt(); ?>
						</div>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'No encontramos contenido.', 'bicyrekkord' ); ?></p>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
