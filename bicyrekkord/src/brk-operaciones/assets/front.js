/* BRK Operaciones — registro de talleres y factura electrónica */
(function ($) {
	'use strict';

	// Registro: mostrar campos de taller.
	var $form = $('form.woocommerce-form-register, form.register');
	function tipo() { return $form.find('input[name="brk_tipo_cuenta"]:checked').val(); }
	function toggleTaller() {
		var es = tipo() === 'taller';
		$form.find('.brk-taller').prop('hidden', !es);
		$form.find('#brk_taller_nombre, #brk_ciudad').prop('required', es);
		if (es) { verificar(); }
	}
	var timer = null, ultimo = '';
	function verificar() {
		if (tipo() !== 'taller' || typeof BRK_OPS === 'undefined') { return; }
		var datos = {
			action: 'brk_verificar_taller',
			nonce: BRK_OPS.nonce,
			correo: $form.find('input[name="email"]').val() || '',
			celular: $form.find('#brk_celular').val() || '',
			doc: $form.find('#brk_doc_numero').val() || ''
		};
		var clave = datos.correo + '|' + datos.celular + '|' + datos.doc;
		if (clave === ultimo || (!datos.correo && datos.celular.replace(/\D/g, '').length < 7 && datos.doc.replace(/\D/g, '').length < 5)) { return; }
		ultimo = clave;
		var $msg = $form.find('.brk-verificacion');
		$.post(BRK_OPS.ajax, datos).done(function (r) {
			if (!r || !r.success) { return; }
			var $doc = $form.find('#brk_doc_numero');
			if (r.data.encontrado) {
				$msg.attr('class', 'brk-verificacion is-ok').text('Encontramos tu taller en nuestra base de datos. No necesitas enviar documento.');
				$doc.prop('required', false);
				$form.find('.brk-doc-req').text('(opcional)');
			} else {
				$msg.attr('class', 'brk-verificacion is-nuevo').text('Aún no tenemos tu taller en nuestra base de datos: escribe el NIT o tu documento de identidad para crear la cuenta.');
				$doc.prop('required', true);
				$form.find('.brk-doc-req').text('(obligatorio)');
			}
		});
	}
	if ($form.length) {
		$form.on('change', 'input[name="brk_tipo_cuenta"]', toggleTaller);
		$form.on('input change', 'input[name="email"], #brk_celular, #brk_doc_numero', function () {
			clearTimeout(timer);
			timer = setTimeout(verificar, 600);
		});
		toggleTaller();
	}

	// Checkout: factura electrónica.
	$(document.body).on('change', 'input[name="brk_fe"]', function () {
		var si = $('input[name="brk_fe"]:checked').val() === 'si';
		$('.brk-fe-datos').prop('hidden', !si);
		$('.brk-fe-datos').find('#brk_fe_doc_num, #brk_fe_razon').prop('required', si);
	});
	$('input[name="brk_fe"]:checked').trigger('change');
})(jQuery);
