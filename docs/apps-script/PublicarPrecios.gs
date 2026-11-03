/**
 * E-VIREXION — Publicar la Guía de precios desde este Google Sheet.
 *
 * Instalación (una sola vez): Extensiones › Apps Script › pega este archivo
 * completo › Guardar › vuelve al Sheet y recarga la página. Aparece el menú
 * "E-Virexion". Abre "Configurar conexión" y pega la clave de publicación.
 *
 * Uso: edita el Sheet › E-Virexion › Publicar precios en la web › revisa el
 * resumen › Sí. La página /prices se actualiza al instante.
 *
 * Varios países: cada país es una pestaña. El país se reconoce por el nombre
 * de la pestaña ("Colombia", "México", "Brasil", "Perú", "Argentina", "Chile")
 * o, si el nombre no lo dice, por el título de las dos primeras filas. Solo se
 * publican pestañas que tengan la fila de encabezados con "Marca" y "Modelo",
 * así que "Notas" y "Marcas" se ignoran solas.
 */

var DEFAULT_SITE_URL = 'https://e-virexion.evirexion.workers.dev';

// Código de país que entiende la web → palabras que lo identifican (sin tildes, minúsculas).
var COUNTRY_WORDS = {
  CO: ['colombia'],
  MX: ['mexico'],
  BR: ['brasil', 'brazil'],
  PE: ['peru'],
  AR: ['argentina'],
  CL: ['chile'],
};
var COUNTRY_NAMES = { CO: 'Colombia', MX: 'México', BR: 'Brasil', PE: 'Perú', AR: 'Argentina', CL: 'Chile' };
// Pestañas de apoyo que nunca son una lista de precios.
var IGNORED_TABS = /^(notas?|marcas?|instrucciones|leeme|backup|respaldo|copia)/;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('E-Virexion')
    .addItem('Publicar precios en la web', 'publicarPrecios')
    .addItem('Ver cambios sin publicar', 'verCambios')
    .addSeparator()
    .addItem('Deshacer última publicación', 'deshacerPublicacion')
    .addItem('Configurar conexión', 'configurarConexion')
    .addToUi();
}

function getConfig_() {
  var props = PropertiesService.getScriptProperties();
  return {
    secret: props.getProperty('PRICES_PUBLISH_SECRET'),
    siteUrl: (props.getProperty('SITE_URL') || DEFAULT_SITE_URL).replace(/\/+$/, ''),
  };
}

function configurarConexion() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var cfg = getConfig_();

  var secret = ui.prompt(
    'Clave de publicación',
    (cfg.secret ? 'Ya hay una clave guardada. Pega una nueva para reemplazarla, o deja vacío para conservarla.\n\n' : '') +
      'Pega la clave PRICES_PUBLISH_SECRET:',
    ui.ButtonSet.OK_CANCEL
  );
  if (secret.getSelectedButton() !== ui.Button.OK) return;
  if (secret.getResponseText().trim()) props.setProperty('PRICES_PUBLISH_SECRET', secret.getResponseText().trim());

  var site = ui.prompt(
    'Dirección de la web',
    'Actual: ' + cfg.siteUrl + '\n\nDeja vacío para conservarla, o escribe otra (ej. https://evirexion.com):',
    ui.ButtonSet.OK_CANCEL
  );
  if (site.getSelectedButton() === ui.Button.OK && site.getResponseText().trim()) {
    props.setProperty('SITE_URL', site.getResponseText().trim());
  }
  ui.alert('Conexión guardada ✔');
}

function plain_(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function countryIn_(text) {
  var t = plain_(text);
  for (var code in COUNTRY_WORDS) {
    if (COUNTRY_WORDS[code].some(function (w) { return t.indexOf(w) !== -1; })) return code;
  }
  return null;
}

function hasHeader_(rows) {
  for (var i = 0; i < Math.min(rows.length, 15); i++) {
    var cells = rows[i].map(function (c) { return plain_(c).trim(); });
    if (cells.indexOf('marca') !== -1 && cells.indexOf('modelo') !== -1) return true;
  }
  return false;
}

/** Una entrada por país: { country, tab, rows }. Lanza error si dos pestañas dicen ser el mismo país. */
function getCountryTabs_() {
  var found = {};
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (IGNORED_TABS.test(plain_(name).trim())) return;
    // Valores tal como se ven ("$79M – $85M", "R$ 118.990"), que es lo que la web sabe leer.
    var rows = sheet.getDataRange().getDisplayValues();
    if (!hasHeader_(rows)) return;

    var byName = countryIn_(name);
    var code = byName || countryIn_((rows[0] || []).join(' ') + ' ' + (rows[1] || []).join(' '));
    // La pestaña original de Colombia se llama "Guía de Precios" y su título dice "Colombia".
    if (!code) return;

    var entry = { country: code, tab: name, rows: rows, byName: Boolean(byName) };
    var other = found[code];
    if (!other) { found[code] = entry; return; }
    if (entry.byName && !other.byName) { found[code] = entry; return; }
    if (other.byName && !entry.byName) return;
    throw new Error(
      'Las pestañas "' + other.tab + '" y "' + name + '" parecen ser las dos de ' + COUNTRY_NAMES[code] +
      '. Renombra la que no se debe publicar (por ejemplo "Copia ' + name + '").'
    );
  });
  var list = Object.keys(COUNTRY_WORDS).filter(function (c) { return found[c]; }).map(function (c) { return found[c]; });
  if (!list.length) throw new Error('No encontré ninguna pestaña de país con encabezados "Marca" y "Modelo".');
  return list;
}

function call_(payload) {
  var cfg = getConfig_();
  if (!cfg.secret) throw new Error('Falta la clave. Ve a E-Virexion › Configurar conexión.');
  var res = UrlFetchApp.fetch(cfg.siteUrl + '/api/prices/publish', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + cfg.secret },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  var body;
  try { body = JSON.parse(res.getContentText()); } catch (e) {
    throw new Error('La web respondió algo inesperado (' + res.getResponseCode() + '). ¿Está desplegada la última versión?');
  }
  return body;
}

function list_(title, items, max) {
  if (!items || !items.length) return '';
  var shown = items.slice(0, max).map(function (x) { return '    • ' + x; }).join('\n');
  var more = items.length > max ? '\n    … y ' + (items.length - max) + ' más' : '';
  return '\n  ' + title + ' (' + items.length + '):\n' + shown + more;
}

function hasChanges_(s) {
  return s.added.length + s.changed.length + s.removed.length > 0;
}

function describe_(previews) {
  var max = previews.length > 1 ? 6 : 15;
  return previews.map(function (p) {
    var s = p.summary;
    var text = '■ ' + COUNTRY_NAMES[p.country] + ' (pestaña "' + p.tab + '"): ' + s.total + ' vehículos   (en la web ahora: ' + s.previousTotal + ')';
    if (!hasChanges_(s)) text += '\n  Sin cambios.';
    text += list_('Nuevos', s.added, max);
    text += list_('Con cambios', s.changed, max);
    text += list_('Se quitarán de la web', s.removed, max);
    text += list_('⚠ Filas que NO se publicarán (revisar)', s.problems, max);
    text += list_('Notas', s.notes, max);
    return text;
  }).join('\n\n');
}

function preview_() {
  return getCountryTabs_().map(function (t) {
    var r = call_({ country: t.country, rows: t.rows, dryRun: true });
    if (!r.ok) throw new Error(COUNTRY_NAMES[t.country] + ': ' + r.error);
    return { country: t.country, tab: t.tab, rows: t.rows, summary: r.summary };
  });
}

function verCambios() {
  var ui = SpreadsheetApp.getUi();
  try {
    ui.alert('Cambios pendientes', describe_(preview_()), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('No se pudo revisar', String(e.message || e), ui.ButtonSet.OK);
  }
}

function publicarPrecios() {
  var ui = SpreadsheetApp.getUi();
  try {
    var previews = preview_();
    var pending = previews.filter(function (p) { return hasChanges_(p.summary); });
    if (!pending.length) {
      ui.alert('Nada que publicar', describe_(previews), ui.ButtonSet.OK);
      return;
    }

    var blocked = pending.filter(function (p) { return p.summary.blocked; });
    if (blocked.length) {
      var warn = ui.alert(
        '⚠ Cuidado',
        blocked.map(function (p) {
          return COUNTRY_NAMES[p.country] + ': quedarían solo ' + p.summary.total + ' vehículos (hoy hay ' + p.summary.previousTotal + ').';
        }).join('\n') + '\n\n¿Seguro que quieres publicar de todas formas?',
        ui.ButtonSet.YES_NO
      );
      if (warn !== ui.Button.YES) return;
    }

    var ok = ui.alert('¿Publicar en la web?', describe_(previews), ui.ButtonSet.YES_NO);
    if (ok !== ui.Button.YES) return;

    var user = Session.getActiveUser().getEmail();
    var done = [];
    pending.forEach(function (p) {
      var r = call_({ country: p.country, rows: p.rows, dryRun: false, force: Boolean(p.summary.blocked), publishedBy: user });
      if (!r.ok) {
        throw new Error(COUNTRY_NAMES[p.country] + ': ' + r.error + (done.length ? '\n\nYa se publicó: ' + done.join(', ') : ''));
      }
      done.push(COUNTRY_NAMES[p.country]);
      // Lo que se publicó, para que "Deshacer" sepa qué países restaurar.
      PropertiesService.getScriptProperties().setProperty(
        'LAST_PUBLISHED_COUNTRIES',
        pending.slice(0, done.length).map(function (x) { return x.country; }).join(',')
      );
    });
    ui.alert('Publicado ✔', 'Actualizado: ' + done.join(', ') + '\n\n' + getConfig_().siteUrl + '/prices', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('No se pudo publicar', String(e.message || e), ui.ButtonSet.OK);
  }
}

function deshacerPublicacion() {
  var ui = SpreadsheetApp.getUi();
  var last = (PropertiesService.getScriptProperties().getProperty('LAST_PUBLISHED_COUNTRIES') || 'CO').split(',');
  var names = last.map(function (c) { return COUNTRY_NAMES[c] || c; }).join(', ');
  if (ui.alert('Deshacer', '¿Volver a la versión anterior de: ' + names + '?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  try {
    var messages = last.map(function (c) {
      var r = call_({ action: 'rollback', country: c });
      // La web ya antepone el nombre del país a sus mensajes.
      return r.ok ? r.message : r.error;
    });
    PropertiesService.getScriptProperties().deleteProperty('LAST_PUBLISHED_COUNTRIES');
    ui.alert('Listo', messages.join('\n'), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('No se pudo deshacer', String(e.message || e), ui.ButtonSet.OK);
  }
}
