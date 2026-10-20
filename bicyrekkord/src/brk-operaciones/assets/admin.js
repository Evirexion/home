/* Pedidos BRK — cambio de estado con un clic */
(function () {
	'use strict';
	var cfg = window.BRK_PANEL;
	var panel = document.querySelector('.brk-panel');
	if (!cfg || !panel) { return; }
	var tab = new URLSearchParams(location.search).get('tab') || 'recibidos';
	var enTodos = tab === 'todos' || new URLSearchParams(location.search).get('q');

	function post(datos) {
		var body = new URLSearchParams();
		Object.keys(datos).forEach(function (k) {
			if (Array.isArray(datos[k])) { datos[k].forEach(function (v) { body.append(k + '[]', v); }); }
			else { body.append(k, datos[k]); }
		});
		body.append('nonce', cfg.nonce);
		return fetch(cfg.ajax, { method: 'POST', credentials: 'same-origin', body: body }).then(function (r) { return r.json(); });
	}

	function cambiar(ids, estado, extra) {
		var filas = ids.map(function (id) { return panel.querySelector('.brk-fila[data-id="' + id + '"]'); }).filter(Boolean);
		filas.forEach(function (f) { f.classList.add('is-cargando'); });
		var datos = Object.assign({ action: 'brk_panel_estado', ids: ids, estado: estado }, extra || {});
		return post(datos).then(function (r) {
			filas.forEach(function (f) { f.classList.remove('is-cargando'); });
			if (!r || !r.success) { alertar((r && r.data && r.data.msg) || 'No se pudo cambiar el estado.'); return; }
			r.data.ids.forEach(function (id) {
				var f = panel.querySelector('.brk-fila[data-id="' + id + '"]');
				if (!f) { return; }
				var pill = f.querySelector('.brk-pill');
				pill.className = 'brk-pill brk-pill--' + r.data.estado;
				pill.textContent = r.data.etiqueta;
				f.classList.add('is-movido');
				f.querySelector('.brk-fila__accion').innerHTML = '<span class="brk-ok">Movido a ' + r.data.etiqueta + '</span>';
				if (!enTodos) { setTimeout(function () { f.classList.add('is-saliendo'); setTimeout(function () { f.remove(); vacio(); }, 350); }, 900); }
			});
			Object.keys(r.data.conteos).forEach(function (k) {
				var c = panel.querySelector('.brk-count[data-tab="' + k + '"]');
				if (c) { c.textContent = r.data.conteos[k]; }
			});
			actualizarBulk();
		});
	}

	function alertar(msg) {
		var n = document.createElement('div');
		n.className = 'notice notice-error is-dismissible';
		n.innerHTML = '<p></p>';
		n.querySelector('p').textContent = msg;
		panel.insertBefore(n, panel.querySelector('.brk-tabs') || panel.firstChild);
	}

	function vacio() {
		if (!panel.querySelector('.brk-fila')) {
			var l = panel.querySelector('.brk-lista');
			if (l) { l.outerHTML = '<div class="brk-vacio">No hay pedidos en esta pestaña.</div>'; }
		}
	}

	panel.addEventListener('click', function (e) {
		var b = e.target.closest('.brk-go[data-estado], .brk-go-alt');
		if (b) {
			e.preventDefault();
			var fila = b.closest('.brk-fila');
			var estado = b.getAttribute('data-estado');
			var extra = {};
			if (estado === 'enviado' && b.classList.contains('brk-go-alt')) {
				var guia = window.prompt('Número de guía (opcional):', '');
				if (guia === null) { return; }
				extra.guia = guia;
			}
			cambiar([fila.getAttribute('data-id')], estado, extra);
			return;
		}
		var fe = e.target.closest('.brk-fe-reenviar');
		if (fe) {
			var id = fe.closest('.brk-fila').getAttribute('data-id');
			fe.disabled = true; fe.textContent = 'Enviando…';
			post({ action: 'brk_panel_fe', id: id }).then(function (r) {
				fe.textContent = r && r.success ? r.data.msg : 'No se pudo enviar';
			});
			return;
		}
		var bulk = e.target.closest('[data-bulk]');
		if (bulk) {
			var ids = seleccionados();
			if (!ids.length) { return; }
			var extraB = {};
			if (bulk.getAttribute('data-bulk') === 'enviado') {
				var t = window.prompt('Transportadora para los ' + ids.length + ' pedidos:', '');
				if (t === null) { return; }
				extraB.transportadora = t;
			}
			cambiar(ids, bulk.getAttribute('data-bulk'), extraB);
		}
	});

	panel.addEventListener('submit', function (e) {
		var f = e.target.closest('.brk-envio');
		if (!f) { return; }
		e.preventDefault();
		cambiar([f.getAttribute('data-id')], 'enviado', {
			transportadora: f.elements.transportadora.value,
			guia: f.elements.guia.value
		});
	});

	function seleccionados() {
		return Array.prototype.map.call(panel.querySelectorAll('.brk-check input:checked'), function (i) { return i.value; });
	}
	function actualizarBulk() {
		var n = seleccionados().length;
		var bar = panel.querySelector('.brk-bulk');
		bar.hidden = n === 0;
		bar.querySelector('.brk-bulk__n').textContent = n;
	}
	panel.addEventListener('change', function (e) {
		if (e.target.closest('.brk-check')) {
			e.target.closest('.brk-fila').classList.toggle('is-sel', e.target.checked);
			actualizarBulk();
		}
	});
})();
