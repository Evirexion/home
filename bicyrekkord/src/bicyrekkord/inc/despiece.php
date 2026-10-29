<?php
/**
 * Armar y desarmar productos.
 *
 * 1. Todos los productos: la foto principal llega en piezas que se ensamblan (cortes en el ángulo de la K)
 *    y se separa un poco al pasar el mouse. No necesita fotos nuevas.
 * 2. Despiece real (opcional, por producto): en el editor del producto, caja «Despiece (armar y desarmar)»,
 *    se suben imágenes transparentes de cada pieza (todas del mismo tamaño y alineadas: una encima de la otra
 *    forman el producto armado). En la ficha aparece la sección «Despiece» con el botón Desarmar / Armar.
 */
defined( 'ABSPATH' ) || exit;

/** Piezas del despiece de un producto: [ [ 'id' => adjunto, 'x' => %, 'y' => %, 'label' => texto ], … ] */
function brk_despiece_piezas( $product_id ) {
	$p = get_post_meta( $product_id, '_brk_despiece', true );
	if ( ! is_array( $p ) ) {
		return array();
	}
	return array_values( array_filter( $p, function ( $x ) {
		return ! empty( $x['id'] ) && wp_attachment_is_image( (int) $x['id'] );
	} ) );
}

// ---------- Ficha de producto ----------

add_action( 'wp_enqueue_scripts', function () {
	if ( function_exists( 'is_product' ) && is_product() ) {
		wp_enqueue_script( 'brk-despiece', get_template_directory_uri() . '/assets/js/despiece.js', array(), BRK_THEME_VERSION, true );
	}
}, 30 );

// El zoom al pasar el mouse choca con el efecto de piezas; la foto sigue abriéndose en grande al hacer clic.
add_action( 'after_setup_theme', function () {
	remove_theme_support( 'wc-product-gallery-zoom' );
}, 20 );

add_action( 'woocommerce_after_single_product_summary', function () {
	global $product;
	if ( ! $product ) {
		return;
	}
	$piezas = brk_despiece_piezas( $product->get_id() );
	if ( ! $piezas ) {
		return;
	}
	$primera = wp_get_attachment_image_src( (int) $piezas[0]['id'], 'full' );
	$ratio   = $primera && $primera[1] ? ( $primera[2] / $primera[1] ) : 1;
	?>
	<section class="brk-despiece" id="despiece" aria-labelledby="brk-despiece-titulo">
		<div class="brk-despiece__head">
			<div>
				<p class="brk-eyebrow brk-verde-osc"><?php esc_html_e( 'Despiece', 'bicyrekkord' ); ?></p>
				<h2 class="brk-disp" id="brk-despiece-titulo"><?php esc_html_e( 'Conoce cada pieza', 'bicyrekkord' ); ?></h2>
			</div>
			<button type="button" class="brk-btn brk-btn--negro brk-despiece__btn" aria-pressed="false" data-armar="<?php esc_attr_e( 'Armar', 'bicyrekkord' ); ?>" data-desarmar="<?php esc_attr_e( 'Desarmar', 'bicyrekkord' ); ?>"><?php esc_html_e( 'Desarmar', 'bicyrekkord' ); ?></button>
		</div>
		<div class="brk-despiece__stage" style="aspect-ratio: <?php echo esc_attr( round( 1 / $ratio, 4 ) ); ?>">
			<?php foreach ( $piezas as $i => $p ) : ?>
				<figure class="brk-despiece__pieza" style="--dx: <?php echo (float) $p['x']; ?>; --dy: <?php echo (float) $p['y']; ?>; --i: <?php echo (int) $i; ?>">
					<?php echo wp_get_attachment_image( (int) $p['id'], 'full', false, array( 'alt' => $p['label'] ?? '', 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
					<?php if ( ! empty( $p['label'] ) ) : ?>
						<figcaption class="brk-despiece__label"><?php echo esc_html( $p['label'] ); ?></figcaption>
					<?php endif; ?>
				</figure>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
}, 5 );

// Enlace "Ver despiece" junto a la foto.
add_action( 'woocommerce_product_thumbnails', function () {
	global $product;
	if ( $product && brk_despiece_piezas( $product->get_id() ) ) {
		echo '<a class="brk-ver-despiece" href="#despiece">' . esc_html__( 'Ver despiece', 'bicyrekkord' ) . ' ↓</a>';
	}
}, 30 );

// ---------- Editor del producto ----------

add_action( 'add_meta_boxes_product', function () {
	add_meta_box( 'brk-despiece', __( 'Despiece (armar y desarmar)', 'bicyrekkord' ), 'brk_despiece_metabox', 'product', 'normal', 'default' );
} );

function brk_despiece_metabox( $post ) {
	wp_nonce_field( 'brk_despiece', 'brk_despiece_nonce' );
	wp_enqueue_media();
	$piezas = brk_despiece_piezas( $post->ID );
	?>
	<p><?php esc_html_e( 'Opcional. Sube una imagen transparente (PNG o WebP) por cada pieza del producto. Todas deben tener el mismo tamaño y estar alineadas: puestas una encima de otra forman el producto armado. X e Y indican hacia dónde se mueve cada pieza al desarmar, en % del ancho (negativo = izquierda o arriba).', 'bicyrekkord' ); ?></p>
	<table class="widefat brk-despiece-tabla">
		<thead><tr><th style="width:90px"><?php esc_html_e( 'Pieza', 'bicyrekkord' ); ?></th><th><?php esc_html_e( 'Nombre (opcional)', 'bicyrekkord' ); ?></th><th style="width:90px">X %</th><th style="width:90px">Y %</th><th style="width:60px"></th></tr></thead>
		<tbody>
		<?php foreach ( $piezas as $p ) { brk_despiece_fila( $p ); } ?>
		</tbody>
	</table>
	<p><button type="button" class="button brk-despiece-agregar"><?php esc_html_e( 'Añadir piezas', 'bicyrekkord' ); ?></button></p>
	<script type="text/template" id="brk-despiece-plantilla"><?php brk_despiece_fila( array( 'id' => '{{id}}', 'x' => 0, 'y' => 0, 'label' => '' ), '{{url}}' ); ?></script>
	<script>
	(function () {
		var tabla = document.querySelector('.brk-despiece-tabla tbody');
		var plantilla = document.getElementById('brk-despiece-plantilla').innerHTML;
		document.querySelector('.brk-despiece-agregar').addEventListener('click', function () {
			var frame = wp.media({ title: 'Piezas del despiece', multiple: true, library: { type: 'image' } });
			frame.on('select', function () {
				frame.state().get('selection').each(function (a) {
					var s = a.toJSON();
					var url = (s.sizes && s.sizes.thumbnail ? s.sizes.thumbnail.url : s.url);
					tabla.insertAdjacentHTML('beforeend', plantilla.split('{{id}}').join(s.id).split('{{url}}').join(url));
				});
			});
			frame.open();
		});
		tabla.addEventListener('click', function (e) {
			if (e.target.classList.contains('brk-despiece-quitar')) { e.target.closest('tr').remove(); }
		});
	})();
	</script>
	<?php
}

function brk_despiece_fila( $p, $url = '' ) {
	if ( ! $url && is_numeric( $p['id'] ) ) {
		$url = wp_get_attachment_image_url( (int) $p['id'], 'thumbnail' );
	}
	?>
	<tr>
		<td><img src="<?php echo esc_url( $url ); ?>" alt="" style="width:64px;height:64px;object-fit:contain;background:#f0f0f1"><input type="hidden" name="brk_despiece[id][]" value="<?php echo esc_attr( $p['id'] ); ?>"></td>
		<td><input type="text" class="widefat" name="brk_despiece[label][]" value="<?php echo esc_attr( $p['label'] ?? '' ); ?>"></td>
		<td><input type="number" step="1" min="-60" max="60" class="small-text" name="brk_despiece[x][]" value="<?php echo esc_attr( $p['x'] ?? 0 ); ?>"></td>
		<td><input type="number" step="1" min="-60" max="60" class="small-text" name="brk_despiece[y][]" value="<?php echo esc_attr( $p['y'] ?? 0 ); ?>"></td>
		<td><button type="button" class="button-link brk-despiece-quitar"><?php esc_html_e( 'Quitar', 'bicyrekkord' ); ?></button></td>
	</tr>
	<?php
}

add_action( 'save_post_product', function ( $post_id ) {
	if ( ! isset( $_POST['brk_despiece_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['brk_despiece_nonce'] ) ), 'brk_despiece' ) ) {
		return;
	}
	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$d      = isset( $_POST['brk_despiece'] ) ? (array) wp_unslash( $_POST['brk_despiece'] ) : array(); // phpcs:ignore
	$piezas = array();
	foreach ( (array) ( $d['id'] ?? array() ) as $i => $id ) {
		$id = (int) $id;
		if ( ! $id ) {
			continue;
		}
		$piezas[] = array(
			'id'    => $id,
			'x'     => max( -60, min( 60, (float) ( $d['x'][ $i ] ?? 0 ) ) ),
			'y'     => max( -60, min( 60, (float) ( $d['y'][ $i ] ?? 0 ) ) ),
			'label' => sanitize_text_field( $d['label'][ $i ] ?? '' ),
		);
	}
	if ( $piezas ) {
		update_post_meta( $post_id, '_brk_despiece', $piezas );
	} else {
		delete_post_meta( $post_id, '_brk_despiece' );
	}
} );
