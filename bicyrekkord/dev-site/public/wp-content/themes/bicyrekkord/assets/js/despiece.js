/* Bicyrekkord — armar y desarmar productos en la ficha */
(function () {
	'use strict';
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var PIEZAS = 6;

	/* 1. Foto principal: llega en piezas (cortes en el ángulo de la K) y se ensambla. */
	function armarFoto() {
		var cont = document.querySelector('.woocommerce-product-gallery__image');
		var img = cont && cont.querySelector('img');
		if (!cont || !img || cont.querySelector('.brk-armado')) { return; }
		var src = img.currentSrc || img.src;
		var capa = document.createElement('div');
		capa.className = 'brk-armado';
		capa.setAttribute('aria-hidden', 'true');
		var ancho = 100 / PIEZAS, incl = 14; // inclinación de los cortes, en % del alto
		for (var i = 0; i < PIEZAS; i++) {
			var x0 = i === 0 ? -30 : i * ancho, x1 = i === PIEZAS - 1 ? 130 : (i + 1) * ancho;
			var p = document.createElement('img');
			p.src = src;
			p.alt = '';
			p.className = 'brk-armado__pieza';
			p.style.clipPath = 'polygon(' + (x0 + incl) + '% 0,' + (x1 + incl) + '% 0,' + (x1 - incl) + '% 100%,' + (x0 - incl) + '% 100%)';
			var lado = i % 2 ? 1 : -1;
			p.style.setProperty('--ox', (lado * (40 + i * 10)) + 'px');
			p.style.setProperty('--oy', (-lado * (60 + i * 12)) + 'px');
			p.style.setProperty('--hx', (lado * 6) + 'px');
			p.style.setProperty('--hy', (-lado * 10) + 'px');
			p.style.setProperty('--r', (lado * (4 + i)) + 'deg');
			p.style.transitionDelay = (i * 70) + 'ms';
			capa.appendChild(p);
		}
		cont.classList.add('brk-armado-host');
		cont.appendChild(capa);
		img.classList.add('brk-armado-original');
		var mostrar = function () {
			requestAnimationFrame(function () { requestAnimationFrame(function () { capa.classList.add('is-armado'); }); });
		};
		if (reduce) { capa.classList.add('is-armado', 'sin-animacion'); return; }
		var listo = 0;
		capa.querySelectorAll('img').forEach(function (p) {
			if (p.complete) { listo++; } else { p.addEventListener('load', function () { if (++listo === PIEZAS) { mostrar(); } }); }
		});
		if (listo === PIEZAS) { mostrar(); }
		// Al pasar el mouse se separa un poco y vuelve a armarse al salir.
		cont.addEventListener('mouseenter', function () { capa.classList.add('is-abierto'); });
		cont.addEventListener('mouseleave', function () { capa.classList.remove('is-abierto'); });
	}

	/* 2. Despiece real (si el producto tiene piezas cargadas). */
	function despiece() {
		var sec = document.querySelector('.brk-despiece');
		if (!sec) { return; }
		var btn = sec.querySelector('.brk-despiece__btn');
		var stage = sec.querySelector('.brk-despiece__stage');
		function poner(desarmado) {
			stage.classList.toggle('is-desarmado', desarmado);
			btn.setAttribute('aria-pressed', desarmado ? 'true' : 'false');
			btn.textContent = desarmado ? btn.dataset.armar : btn.dataset.desarmar;
		}
		btn.addEventListener('click', function () { poner(!stage.classList.contains('is-desarmado')); });
		// Ubica cada nombre sobre su pieza (centro de la parte visible de la imagen).
		sec.querySelectorAll('.brk-despiece__pieza').forEach(function (f) {
			var im = f.querySelector('img'), lab = f.querySelector('.brk-despiece__label');
			if (!im || !lab) { return; }
			var ubicar = function () {
				try {
					var w = 80, h = Math.max(1, Math.round(80 * im.naturalHeight / im.naturalWidth));
					var c = document.createElement('canvas'); c.width = w; c.height = h;
					var ctx = c.getContext('2d'); ctx.drawImage(im, 0, 0, w, h);
					var d = ctx.getImageData(0, 0, w, h).data, minx = w, miny = h, maxx = 0, maxy = 0;
					for (var y = 0; y < h; y++) { for (var x = 0; x < w; x++) { if (d[(y * w + x) * 4 + 3] > 40) { if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; } } }
					if (maxx >= minx) { lab.style.left = ((minx + maxx) / 2 / w * 100) + '%'; lab.style.top = (miny / h * 100) + '%'; }
				} catch (e) { /* imagen de otro dominio: el nombre queda arriba a la izquierda */ }
			};
			if (im.complete) { ubicar(); } else { im.addEventListener('load', ubicar); }
		});
		if (reduce || !('IntersectionObserver' in window)) { return; }
		// Al llegar a la sección: se ve desarmado y se arma; luego se puede desarmar con el botón.
		poner(true);
		stage.classList.add('sin-transicion');
		requestAnimationFrame(function () { stage.classList.remove('sin-transicion'); });
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (e.isIntersecting) { setTimeout(function () { poner(false); }, 450); io.disconnect(); }
			});
		}, { threshold: 0.45 });
		io.observe(stage);
	}

	function iniciar() { armarFoto(); despiece(); }
	if (document.readyState === 'complete') { setTimeout(iniciar, 50); }
	else { window.addEventListener('load', function () { setTimeout(iniciar, 50); }); }
})();
