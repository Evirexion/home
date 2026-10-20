/* Bicyrekkord — efectos: carga del anillo, barra de carga, rueda con scroll */
(function () {
	'use strict';
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Menú móvil
	var btn = document.getElementById('brk-menu-btn');
	var nav = document.getElementById('brk-nav');
	if (btn && nav) {
		btn.addEventListener('click', function () {
			var abierto = nav.classList.toggle('is-open');
			btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
			document.body.classList.toggle('brk-menu-abierto', abierto);
		});
	}

	// Contador de carga del anillo (0 → 100 %)
	var num = document.getElementById('brk-carga-num');
	if (num) {
		if (reduce) { num.textContent = '100'; }
		else {
			var t0 = performance.now() + 300, dur = 2200;
			var tick = function (now) {
				var p = Math.max(0, Math.min(1, (now - t0) / dur));
				var e = 1 - Math.pow(1 - p, 3);
				num.textContent = Math.round(e * 100);
				if (p < 1) { requestAnimationFrame(tick); }
			};
			requestAnimationFrame(tick);
		}
	}

	// Barra de carga bajo el encabezado + rueda que gira con el scroll
	var barra = document.getElementById('brk-carga');
	var rueda = document.getElementById('brk-rueda');
	var vel = document.getElementById('brk-vel');
	var gauge = document.getElementById('brk-gauge');
	var ultimoY = window.scrollY, ultimoT = performance.now(), velocidad = 0, angulo = 0, pendiente = false;

	function pintar() {
		pendiente = false;
		var y = window.scrollY, ahora = performance.now();
		var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
		if (barra) { barra.style.transform = 'scaleX(' + Math.min(1, y / max) + ')'; }
		var dt = Math.max(16, ahora - ultimoT);
		var v = Math.abs(y - ultimoY) / dt * 60;
		ultimoY = y; ultimoT = ahora;
		velocidad = Math.min(99, velocidad * 0.6 + v * 0.9);
		if (rueda && !reduce) {
			angulo = y * 0.7;
			rueda.style.transform = 'rotate(' + angulo + 'deg)';
		}
		mostrarVel();
	}
	function mostrarVel() {
		if (vel) { vel.textContent = Math.round(velocidad); }
		if (gauge) { gauge.style.strokeDashoffset = Math.round(1232 - (velocidad / 99) * 924); }
	}
	window.addEventListener('scroll', function () {
		if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
	}, { passive: true });
	setInterval(function () {
		if (velocidad > 0.5) { velocidad *= 0.82; mostrarVel(); }
		else if (velocidad) { velocidad = 0; mostrarVel(); }
	}, 120);
	pintar();

	// Encabezado compacto al bajar
	var header = document.getElementById('brk-header');
	if (header) {
		var compacto = function () { header.classList.toggle('is-compacto', window.scrollY > 40); };
		window.addEventListener('scroll', compacto, { passive: true });
		compacto();
	}
})();
