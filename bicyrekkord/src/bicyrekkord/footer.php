<?php defined( 'ABSPATH' ) || exit; ?>
</div><!-- #contenido -->

<footer class="brk-footer">
	<div class="brk-wrap">
		<div class="brk-footer__grid">
			<div class="brk-footer__marca">
				<img src="<?php echo esc_url( brk_img( 'wordmark-light.svg' ) ); ?>" alt="Bicyrekkord" width="236" height="30">
				<p><?php esc_html_e( 'Líderes en repuestos para vehículos eléctricos de dos ruedas desde 2012. Envíos a nivel nacional y global.', 'bicyrekkord' ); ?></p>
				<div class="brk-redes">
					<?php
					foreach ( array( 'instagram' => 'Instagram', 'facebook' => 'Facebook', 'youtube' => 'YouTube', 'x' => 'X' ) as $k => $n ) {
						$u = brk_mod( 'brk_' . $k );
						if ( $u ) {
							printf( '<a class="brk-iconbtn" href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>', esc_url( $u ), esc_attr( $n ), brk_icono( $k, 18 ) ); // phpcs:ignore
						}
					}
					?>
				</div>
			</div>
			<div>
				<h2 class="brk-eyebrow"><?php esc_html_e( 'Visítanos', 'bicyrekkord' ); ?></h2>
				<p><?php echo nl2br( esc_html( brk_mod( 'brk_direccion' ) ) ); ?></p>
				<h2 class="brk-eyebrow"><?php esc_html_e( 'Horario', 'bicyrekkord' ); ?></h2>
				<p><?php echo nl2br( esc_html( brk_mod( 'brk_horario' ) ) ); ?></p>
			</div>
			<div>
				<h2 class="brk-eyebrow"><?php esc_html_e( 'Contacto', 'bicyrekkord' ); ?></h2>
				<p>
					<?php foreach ( array_filter( array_map( 'trim', explode( "\n", brk_mod( 'brk_telefonos' ) ) ) ) as $t ) : ?>
						<a href="tel:<?php echo esc_attr( preg_replace( '/\D+/', '', $t ) ); ?>"><?php echo esc_html( $t ); ?></a><br>
					<?php endforeach; ?>
					<a href="mailto:<?php echo esc_attr( brk_mod( 'brk_correo' ) ); ?>"><?php echo esc_html( brk_mod( 'brk_correo' ) ); ?></a>
				</p>
			</div>
			<div>
				<h2 class="brk-eyebrow"><?php esc_html_e( 'Políticas', 'bicyrekkord' ); ?></h2>
				<?php
				wp_nav_menu( array(
					'theme_location' => 'legal',
					'container'      => false,
					'menu_class'     => 'brk-legal',
					'depth'          => 1,
					'fallback_cb'    => function () {
						$p = array(
							'/politicas-de-envios/'                     => __( 'Política de envíos', 'bicyrekkord' ),
							'/politica-de-garantia/'                    => __( 'Política de garantía', 'bicyrekkord' ),
							'/politica-de-privacidad/'                  => __( 'Política de privacidad', 'bicyrekkord' ),
							'/politica-tratamiento-de-datos-personales/' => __( 'Tratamiento de datos personales', 'bicyrekkord' ),
							'/politica-de-devoluciones-y-reembolsos/'   => __( 'Devoluciones y reembolsos', 'bicyrekkord' ),
						);
						echo '<ul class="brk-legal">';
						foreach ( $p as $u => $t ) {
							echo '<li><a href="' . esc_url( home_url( $u ) ) . '">' . esc_html( $t ) . '</a></li>';
						}
						echo '</ul>';
					},
				) );
				?>
			</div>
		</div>
		<div class="brk-footer__legal">
			<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Rekkord S.A.S. · NIT 900.560.734-4 · <?php esc_html_e( 'Todos los derechos reservados.', 'bicyrekkord' ); ?></span>
			<span>@bicyrekkord</span>
		</div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
