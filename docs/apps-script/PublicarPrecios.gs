/**
 * E-VIREXION — Publicar la Guía de precios desde este Google Sheet.
 *
 * Instalación (una sola vez): Extensiones › Apps Script › pega este archivo
 * completo › Guardar › vuelve al Sheet y recarga la página. Aparece el menú
 * "E-Virexion". Abre "Configurar conexión" y pega la clave de publicación.
 *
 * Uso: edita el Sheet › E-Virexion › Publicar precios en la web › revisa el
 * resumen › Sí. La página /prices se actualiza al instante.
 */

// Pestaña con la lista maestra (gid de la URL). Si no existe, usa la pestaña activa.
var PRICES_SHEET_GID = 1865210025;
var DEFAULT_SITE_URL = 'https://e-virexion.evirexion.workers.dev';

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

function getRows_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets().filter(function (s) { return s.getSheetId() === PRICES_SHEET_GID; })[0] || ss.getActiveSheet();
  // Valores tal como se ven ("$79M – $85M"), que es lo que la web sabe leer.
  return sheet.getDataRange().getDisplayValues();
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
  max = max || 15;
  var shown = items.slice(0, max).map(function (x) { return '  • ' + x; }).join('\n');
  var more = items.length > max ? '\n  … y ' + (items.length - max) + ' más' : '';
  return '\n\n' + title + ' (' + items.length + '):\n' + shown + more;
}

function describe_(s) {
  var text = 'Vehículos en el Sheet: ' + s.total + '   (en la web ahora: ' + s.previousTotal + ')';
  if (!s.added.length && !s.changed.length && !s.removed.length) text += '\n\nNo hay cambios frente a lo que ya está publicado.';
  text += list_('Nuevos', s.added);
  text += list_('Con cambios', s.changed);
  text += list_('Se quitarán de la web', s.removed);
  text += list_('⚠ Filas que NO se publicarán (revisar)', s.problems, 10);
  return text;
}

function verCambios() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = call_({ rows: getRows_(), dryRun: true });
    if (!r.ok) throw new Error(r.error);
    ui.alert('Cambios pendientes', describe_(r.summary), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('No se pudo revisar', String(e.message || e), ui.ButtonSet.OK);
  }
}

function publicarPrecios() {
  var ui = SpreadsheetApp.getUi();
  try {
    var rows = getRows_();
    var preview = call_({ rows: rows, dryRun: true });
    if (!preview.ok) throw new Error(preview.error);
    var s = preview.summary;

    var force = false;
    if (s.blocked) {
      var warn = ui.alert(
        '⚠ Cuidado',
        'Esta publicación dejaría solo ' + s.total + ' vehículos (hoy hay ' + s.previousTotal + ').\n¿Seguro que quieres publicar de todas formas?',
        ui.ButtonSet.YES_NO
      );
      if (warn !== ui.Button.YES) return;
      force = true;
    }

    var ok = ui.alert('¿Publicar en la web?', describe_(s), ui.ButtonSet.YES_NO);
    if (ok !== ui.Button.YES) return;

    var r = call_({ rows: rows, dryRun: false, force: force, publishedBy: Session.getActiveUser().getEmail() });
    if (!r.ok) throw new Error(r.error);
    ui.alert('Publicado ✔', s.total + ' vehículos ya están en ' + getConfig_().siteUrl + '/prices', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('No se pudo publicar', String(e.message || e), ui.ButtonSet.OK);
  }
}

function deshacerPublicacion() {
  var ui = SpreadsheetApp.getUi();
  if (ui.alert('Deshacer', '¿Volver a la versión publicada antes de la última?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  try {
    var r = call_({ action: 'rollback' });
    if (!r.ok) throw new Error(r.error);
    ui.alert('Listo ✔', r.message, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('No se pudo deshacer', String(e.message || e), ui.ButtonSet.OK);
  }
}
