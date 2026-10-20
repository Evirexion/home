/* Demo Bicyrekkord — vista rápida.
 * Las páginas públicas son una copia estática (abren al instante).
 * Lo que necesita WordPress (cuentas, carrito, pago, panel) se abre en la demo interactiva (/probar/).
 */
(function () {
	'use strict';
	var PROBAR = '/probar/';
	var DINAMICO = /^\/(mi-cuenta|carrito|finalizar-compra|wp-admin|wp-login\.php)(\/|$)/;

	function ir(destino) {
		location.href = PROBAR + '?ir=' + encodeURIComponent(destino || '/');
	}

	document.addEventListener('click', function (e) {
		var boton = e.target.closest('.add_to_cart_button, .single_add_to_cart_button, .ajax_add_to_cart');
		if (boton) {
			e.preventDefault();
			e.stopImmediatePropagation();
			ir(location.pathname);
			return;
		}
		var a = e.target.closest('a[href]');
		if (!a) { return; }
		var u;
		try { u = new URL(a.getAttribute('href'), location.href); } catch (_) { return; }
		if (u.origin === location.origin && (DINAMICO.test(u.pathname) || u.search.indexOf('add-to-cart') > -1)) {
			e.preventDefault();
			e.stopImmediatePropagation();
			ir(u.pathname + u.search);
		}
	}, true);

	document.addEventListener('submit', function (e) {
		var f = e.target;
		if (!(f instanceof HTMLFormElement)) { return; }
		e.preventDefault();
		e.stopImmediatePropagation();
		if (f.matches('form.cart')) { ir(location.pathname); return; }
		var accion = new URL(f.getAttribute('action') || location.pathname, location.href).pathname;
		var q = new URLSearchParams(new FormData(f)).toString();
		ir(accion + (q ? '?' + q : ''));
	}, true);

	// Barra de demostración
	var css = '.brk-demo-barra{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 24px);background:#0B0D0C;color:#F2F4F2;border:1px solid rgba(0,191,26,.6);border-radius:999px;padding:8px 8px 8px 16px;font:600 13px/1.3 Montserrat,system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.35)}' +
		'.brk-demo-barra b{background:#00BF1A;color:#0B0D0C;border-radius:6px;padding:2px 6px;font-size:11px;letter-spacing:.08em}' +
		'.brk-demo-barra a{background:#00BF1A;color:#0B0D0C;border-radius:999px;padding:9px 16px;font-weight:800;text-decoration:none;white-space:nowrap}' +
		'.brk-demo-barra a:hover{background:#2BD843;color:#0B0D0C}' +
		'@media (max-width:640px){.brk-demo-barra{flex-wrap:nowrap;left:auto;right:12px;transform:none;bottom:12px;padding:6px 6px 6px 12px}.brk-demo-barra span{display:none}.brk-demo-barra a{padding:8px 12px}}';
	var st = document.createElement('style');
	st.textContent = css;
	document.head.appendChild(st);
	var bar = document.createElement('div');
	bar.className = 'brk-demo-barra';
	bar.setAttribute('role', 'region');
	bar.setAttribute('aria-label', 'Sitio de demostración');
	bar.innerHTML = '<b>DEMO</b><span>Para crear cuentas, comprar o ver el panel de pedidos:</span><a href="/probar/">Probar cuentas y pedidos</a>';
	bar.querySelector('a').addEventListener('click', function (e) { e.preventDefault(); ir(location.pathname); });
	document.body.appendChild(bar);
})();
