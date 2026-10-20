<?php
/**
 * Factura electrónica: en el checkout se pregunta si el cliente la necesita.
 * Si responde "Sí", los datos fiscales se guardan en el pedido y la solicitud se
 * envía por correo a contabilidad (por defecto contabilidad@bicyrekkord.com).
 */
defined( 'ABSPATH' ) || exit;

add_action( 'woocommerce_after_checkout_billing_form', function () {
	$uid  = get_current_user_id();
	$val  = function ( $campo, $meta = '' ) use ( $uid ) {
		if ( isset( $_POST[ $campo ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return sanitize_text_field( wp_unslash( $_POST[ $campo ] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		}
		return $uid && $meta ? (string) get_user_meta( $uid, $meta, true ) : '';
	};
	$fe       = $val( 'brk_fe' ) ?: 'no';
	$doc_tipo = $val( 'brk_fe_doc_tipo', 'brk_doc_tipo' ) ?: 'CC';
	$razon    = $val( 'brk_fe_razon', 'brk_fe_razon' ) ?: ( $uid ? (string) get_user_meta( $uid, 'billing_company', true ) : '' );
	$correo   = $val( 'brk_fe_correo', 'brk_fe_correo' );
	?>
	<div class="brk-fe">
		<h3>Factura electrónica</h3>
		<fieldset class="brk-fe-pregunta">
			<legend>¿Necesitas factura electrónica?</legend>
			<label class="brk-opcion"><input type="radio" name="brk_fe" value="no" <?php checked( $fe, 'no' ); ?>><span><strong>No</strong></span></label>
			<label class="brk-opcion"><input type="radio" name="brk_fe" value="si" <?php checked( $fe, 'si' ); ?>><span><strong>Sí, la necesito</strong></span></label>
		</fieldset>
		<div class="brk-fe-datos" <?php echo 'si' === $fe ? '' : 'hidden'; ?>>
			<p class="brk-nota">Enviaremos tu solicitud a nuestro equipo de contabilidad, que te hará llegar la factura al correo que indiques.</p>
			<p class="form-row form-row-first"><label for="brk_fe_doc_tipo">Tipo de documento <span class="required">*</span></label>
				<select name="brk_fe_doc_tipo" id="brk_fe_doc_tipo">
					<?php foreach ( brk_tipos_documento() as $k => $v ) : ?>
						<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $doc_tipo, $k ); ?>><?php echo esc_html( $v ); ?></option>
					<?php endforeach; ?>
				</select></p>
			<p class="form-row form-row-last"><label for="brk_fe_doc_num">Número de documento / NIT <span class="required">*</span></label>
				<input type="text" class="input-text" name="brk_fe_doc_num" id="brk_fe_doc_num" inputmode="numeric" value="<?php echo esc_attr( $val( 'brk_fe_doc_num', 'brk_doc_numero' ) ); ?>"></p>
			<p class="form-row form-row-wide"><label for="brk_fe_razon">Nombre o razón social <span class="required">*</span></label>
				<input type="text" class="input-text" name="brk_fe_razon" id="brk_fe_razon" value="<?php echo esc_attr( $razon ); ?>"></p>
			<p class="form-row form-row-wide"><label for="brk_fe_correo">Correo para recibir la factura</label>
				<input type="email" class="input-text" name="brk_fe_correo" id="brk_fe_correo" placeholder="Si lo dejas vacío usamos tu correo de facturación" value="<?php echo esc_attr( $correo ); ?>"></p>
			<div class="clear"></div>
		</div>
	</div>
	<?php
} );

add_action( 'woocommerce_after_checkout_validation', function ( $data, $errors ) {
	if ( 'si' !== brk_post( 'brk_fe' ) ) {
		return;
	}
	$num = brk_digitos( brk_post( 'brk_fe_doc_num' ) );
	if ( strlen( $num ) < 5 || strlen( $num ) > 15 ) {
		$errors->add( 'brk_fe_doc_num', '<strong>Factura electrónica:</strong> escribe un número de documento o NIT válido.' );
	}
	if ( ! brk_post( 'brk_fe_razon' ) ) {
		$errors->add( 'brk_fe_razon', '<strong>Factura electrónica:</strong> escribe el nombre o la razón social.' );
	}
	$correo = brk_post( 'brk_fe_correo' );
	if ( $correo && ! is_email( $correo ) ) {
		$errors->add( 'brk_fe_correo', '<strong>Factura electrónica:</strong> revisa el correo para recibir la factura.' );
	}
}, 10, 2 );

add_action( 'woocommerce_checkout_create_order', function ( $order ) {
	$si = 'si' === brk_post( 'brk_fe' );
	$order->update_meta_data( '_brk_fe', $si ? 'si' : 'no' );
	if ( ! $si ) {
		return;
	}
	$tipo   = brk_post( 'brk_fe_doc_tipo' );
	$tipo   = array_key_exists( $tipo, brk_tipos_documento() ) ? $tipo : 'CC';
	$correo = sanitize_email( brk_post( 'brk_fe_correo' ) );
	$order->update_meta_data( '_brk_fe_doc_tipo', $tipo );
	$order->update_meta_data( '_brk_fe_doc_num', brk_post( 'brk_fe_doc_num' ) );
	$order->update_meta_data( '_brk_fe_razon', brk_post( 'brk_fe_razon' ) );
	$order->update_meta_data( '_brk_fe_correo', $correo ? $correo : $order->get_billing_email() );
	$uid = $order->get_customer_id();
	if ( $uid ) {
		update_user_meta( $uid, 'brk_doc_tipo', $tipo );
		update_user_meta( $uid, 'brk_doc_numero', brk_post( 'brk_fe_doc_num' ) );
		update_user_meta( $uid, 'brk_fe_razon', brk_post( 'brk_fe_razon' ) );
		if ( $correo ) {
			update_user_meta( $uid, 'brk_fe_correo', $correo );
		}
	}
} );

add_action( 'woocommerce_checkout_order_processed', function ( $order_id, $posted = array(), $order = null ) {
	$order = $order instanceof WC_Order ? $order : wc_get_order( $order_id );
	if ( $order && 'si' === $order->get_meta( '_brk_fe' ) ) {
		brk_enviar_solicitud_fe( $order );
	}
}, 20, 3 );

/** Envía (o reenvía) la solicitud de factura electrónica a contabilidad. */
function brk_enviar_solicitud_fe( $order ) {
	$para  = brk_correo_contabilidad();
	$num   = $order->get_order_number();
	$tipos = brk_tipos_documento();
	$filas = array(
		'Pedido'                   => '#' . $num,
		'Fecha del pedido'         => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'd/m/Y H:i' ) : '',
		'Tipo de documento'        => $tipos[ $order->get_meta( '_brk_fe_doc_tipo' ) ] ?? $order->get_meta( '_brk_fe_doc_tipo' ),
		'Número de documento / NIT' => $order->get_meta( '_brk_fe_doc_num' ),
		'Nombre o razón social'    => $order->get_meta( '_brk_fe_razon' ),
		'Correo para la factura'   => $order->get_meta( '_brk_fe_correo' ),
		'Cliente'                  => $order->get_formatted_billing_full_name(),
		'Celular'                  => $order->get_billing_phone(),
		'Dirección'                => wp_strip_all_tags( str_replace( '<br/>', ', ', $order->get_formatted_billing_address() ) ),
		'Tipo de cliente'          => brk_es_taller( $order->get_customer_id() ) ? 'Taller' : 'Cliente',
		'Método de pago'           => $order->get_payment_method_title(),
	);
	$html = '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">';
	foreach ( $filas as $k => $v ) {
		$html .= '<tr><th align="left" style="border-bottom:1px solid #e5e5e5;width:42%">' . esc_html( $k ) . '</th><td style="border-bottom:1px solid #e5e5e5">' . esc_html( (string) $v ) . '</td></tr>';
	}
	$html .= '</table><h3 style="margin-top:24px">Productos</h3><table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">';
	$html .= '<tr><th align="left">SKU</th><th align="left">Producto</th><th align="right">Cant.</th><th align="right">Total</th></tr>';
	foreach ( $order->get_items() as $item ) {
		$p     = $item->get_product();
		$html .= '<tr><td style="border-top:1px solid #e5e5e5">' . esc_html( $p ? $p->get_sku() : '' ) . '</td><td style="border-top:1px solid #e5e5e5">' . esc_html( $item->get_name() ) . '</td><td align="right" style="border-top:1px solid #e5e5e5">' . (int) $item->get_quantity() . '</td><td align="right" style="border-top:1px solid #e5e5e5">' . wp_kses_post( wc_price( $item->get_total() ) ) . '</td></tr>';
	}
	$html .= '<tr><td colspan="3" align="right">Envío</td><td align="right">' . wp_kses_post( wc_price( $order->get_shipping_total() ) ) . '</td></tr>';
	$html .= '<tr><td colspan="3" align="right"><strong>Total</strong></td><td align="right"><strong>' . wp_kses_post( wc_price( $order->get_total() ) ) . '</strong></td></tr></table>';
	$html .= '<p style="margin-top:20px"><a href="' . esc_url( $order->get_edit_order_url() ) . '">Abrir el pedido en el administrador</a></p>';

	$asunto  = sprintf( 'Solicitud de factura electrónica — Pedido #%s', $num );
	$headers = array( 'Content-Type: text/html; charset=UTF-8', 'Reply-To: ' . $order->get_billing_email() );
	if ( function_exists( 'WC' ) ) {
		$mailer = WC()->mailer();
		$ok     = $mailer->send( $para, $asunto, $mailer->wrap_message( 'Solicitud de factura electrónica', $html ), $headers );
	} else {
		$ok = wp_mail( $para, $asunto, $html, $headers );
	}
	$order->update_meta_data( '_brk_fe_enviada', $ok ? time() : 0 );
	$order->save_meta_data();
	$order->add_order_note( $ok ? sprintf( 'Solicitud de factura electrónica enviada a %s.', $para ) : sprintf( 'No se pudo enviar la solicitud de factura electrónica a %s. Reenvíala desde Pedidos BRK.', $para ) );
	return $ok;
}

/** Bloque de datos de factura en el detalle del pedido (cliente) y en el administrador. */
function brk_html_fe( $order ) {
	if ( 'si' !== $order->get_meta( '_brk_fe' ) ) {
		return '';
	}
	$tipos = brk_tipos_documento();
	$t     = $order->get_meta( '_brk_fe_doc_tipo' );
	return sprintf(
		'<p><strong>Factura electrónica solicitada</strong><br>%s<br>%s %s<br>%s</p>',
		esc_html( $order->get_meta( '_brk_fe_razon' ) ),
		esc_html( $tipos[ $t ] ?? $t ),
		esc_html( $order->get_meta( '_brk_fe_doc_num' ) ),
		esc_html( $order->get_meta( '_brk_fe_correo' ) )
	);
}
add_action( 'woocommerce_order_details_after_customer_details', function ( $order ) {
	$h = brk_html_fe( $order );
	if ( $h ) {
		echo '<section class="brk-fe-resumen">' . wp_kses_post( $h ) . '<p class="brk-nota">Nuestro equipo de contabilidad te enviará la factura a ese correo.</p></section>';
	}
} );
add_action( 'woocommerce_admin_order_data_after_billing_address', function ( $order ) {
	$h = brk_html_fe( $order );
	if ( $h ) {
		$env = (int) $order->get_meta( '_brk_fe_enviada' );
		echo wp_kses_post( $h ) . '<p><em>' . ( $env ? 'Enviada a contabilidad el ' . esc_html( wp_date( 'd/m/Y H:i', $env ) ) : 'Aún no enviada a contabilidad' ) . '</em></p>';
	}
} );
