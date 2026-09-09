import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Studio tool that triggers the Google Sheet -> Sanity vehicle sync.
 *
 * The Google service account key is never here: this only POSTs to the site's
 * /api/sync-vehicles endpoint, which holds the credentials server-side. The
 * shared secret is typed in by the operator and kept in this browser's
 * localStorage, so it is never compiled into the published Studio bundle
 * (which is downloadable by anyone who can reach the Studio URL).
 *
 * Styling is deliberately plain React with theme-agnostic colors instead of
 * @sanity/ui, because the installed @sanity/ui major varies across sanity 6.x
 * releases and a mismatched copy breaks the Studio build.
 */

const SECRET_STORAGE_KEY = "evx:vehicle-sync-secret";

const SYNC_ENDPOINT =
  (typeof process !== "undefined" && process.env?.SANITY_STUDIO_SYNC_ENDPOINT) ||
  "http://localhost:3000/api/sync-vehicles";

interface SyncChange {
  label: string;
  rowNumber: number;
  fields?: string[];
}

interface SkippedRow {
  rowNumber: number;
  reason: string;
  detail: string;
}

interface SyncSummary {
  dryRun: boolean;
  sheetTitle: string;
  totalRows: number;
  validRows: number;
  added: SyncChange[];
  updated: SyncChange[];
  unchanged: number;
  skipped: {
    total: number;
    byReason: Record<string, number>;
    rows: SkippedRow[];
  };
  durationMs: number;
}

const REASON_LABELS: Record<string, string> = {
  "brand-header": "Encabezados de marca (esperado)",
  "empty-row": "Filas vacías",
  "missing-brand": "Sin marca",
  "missing-model": "Sin modelo",
  "unknown-category": "Categoría desconocida",
  duplicate: "Duplicados en el Sheet",
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { padding: "2rem", maxWidth: 880, margin: "0 auto", fontFamily: "inherit", color: "inherit" },
  heading: { fontSize: "1.5rem", fontWeight: 700, margin: 0 },
  intro: { opacity: 0.75, marginTop: "0.5rem", lineHeight: 1.5 },
  card: {
    marginTop: "1.5rem",
    padding: "1.25rem",
    borderRadius: 10,
    border: "1px solid rgba(128,128,128,0.3)",
    background: "rgba(128,128,128,0.06)",
  },
  label: { display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" },
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
    border: "1px solid rgba(128,128,128,0.4)",
    background: "rgba(128,128,128,0.08)",
    color: "inherit",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  hint: { fontSize: "0.75rem", opacity: 0.65, marginTop: "0.375rem", lineHeight: 1.5 },
  row: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginTop: "1rem" },
  button: {
    padding: "0.5rem 1.125rem",
    borderRadius: 6,
    border: "1px solid transparent",
    background: "#1f8a4c",
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  secondaryButton: {
    padding: "0.5rem 1.125rem",
    borderRadius: 6,
    border: "1px solid rgba(128,128,128,0.45)",
    background: "transparent",
    color: "inherit",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  error: {
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "1px solid rgba(220,80,80,0.5)",
    background: "rgba(220,80,80,0.1)",
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  stat: {
    padding: "0.75rem",
    borderRadius: 8,
    border: "1px solid rgba(128,128,128,0.25)",
    background: "rgba(128,128,128,0.06)",
  },
  statValue: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 },
  statLabel: { fontSize: "0.75rem", opacity: 0.7, marginTop: "0.25rem" },
  sectionTitle: { fontSize: "0.9375rem", fontWeight: 700, margin: "1.5rem 0 0.5rem" },
  list: { margin: 0, padding: 0, listStyle: "none", maxHeight: 260, overflowY: "auto", fontSize: "0.8125rem" },
  listItem: { padding: "0.375rem 0", borderBottom: "1px solid rgba(128,128,128,0.18)", lineHeight: 1.5 },
  muted: { opacity: 0.65 },
};

export function VehicleSyncTool() {
  const [secret, setSecret] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SECRET_STORAGE_KEY);
      if (stored) setSecret(stored);
    } catch {
      // Private mode / blocked storage: the operator just retypes the secret.
    }
  }, []);

  const rememberSecret = useCallback((value: string) => {
    setSecret(value);
    try {
      if (value) window.localStorage.setItem(SECRET_STORAGE_KEY, value);
      else window.localStorage.removeItem(SECRET_STORAGE_KEY);
    } catch {
      // Non-fatal.
    }
  }, []);

  const runSync = useCallback(async () => {
    setRunning(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch(SYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ dryRun }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok: boolean; summary?: SyncSummary; error?: string }
        | null;

      if (!response.ok || !payload?.ok || !payload.summary) {
        setError(payload?.error ?? `La sincronización falló (HTTP ${response.status}).`);
        return;
      }

      setSummary(payload.summary);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `No se pudo contactar el endpoint de sincronización: ${caught.message}`
          : "No se pudo contactar el endpoint de sincronización."
      );
    } finally {
      setRunning(false);
    }
  }, [secret, dryRun]);

  const skippedByReason = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.skipped.byReason).sort((a, b) => b[1] - a[1]);
  }, [summary]);

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>Sincronizar vehículos desde Sheet</h1>
      <p style={styles.intro}>
        Lee la guía de precios desde Google Sheets y la reconcilia con los documentos{" "}
        <code>vehicleListing</code>: crea los vehículos nuevos, actualiza los que cambiaron y deja
        intactos los que están iguales. Las filas de encabezado de marca y las incompletas se omiten
        y se reportan abajo.
      </p>

      <div style={styles.card}>
        <label style={styles.label} htmlFor="sync-secret">
          Clave de sincronización
        </label>
        <input
          id="sync-secret"
          type="password"
          value={secret}
          onChange={(event) => rememberSecret(event.currentTarget.value)}
          placeholder="VEHICLE_SYNC_SECRET"
          style={styles.input}
          autoComplete="off"
        />
        <p style={styles.hint}>
          Se guarda solo en este navegador (localStorage) y se envía al endpoint del sitio. Las
          credenciales de Google nunca pasan por el Studio.
        </p>

        <div style={styles.row}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(event) => setDryRun(event.currentTarget.checked)}
            />
            Simular sin escribir (dry run)
          </label>
        </div>

        <div style={styles.row}>
          <button
            type="button"
            onClick={runSync}
            disabled={running || !secret}
            style={{
              ...styles.button,
              opacity: running || !secret ? 0.6 : 1,
              cursor: running || !secret ? "not-allowed" : "pointer",
            }}
          >
            {running ? "Sincronizando..." : dryRun ? "Simular sincronización" : "Sincronizar ahora"}
          </button>
          {summary ? (
            <button type="button" onClick={() => setSummary(null)} style={styles.secondaryButton}>
              Limpiar resultado
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      {summary ? (
        <div style={styles.card}>
          <strong>
            {summary.dryRun ? "Simulación" : "Sincronización"} de “{summary.sheetTitle}” ·{" "}
            {(summary.durationMs / 1000).toFixed(1)} s
          </strong>
          {summary.dryRun ? (
            <p style={{ ...styles.hint, marginTop: "0.5rem" }}>
              No se escribió nada en Sanity. Desmarca “Simular sin escribir” para aplicar los
              cambios.
            </p>
          ) : null}

          <div style={styles.statGrid}>
            <div style={styles.stat}>
              <div style={styles.statValue}>{summary.added.length}</div>
              <div style={styles.statLabel}>Agregados</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{summary.updated.length}</div>
              <div style={styles.statLabel}>Actualizados</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{summary.unchanged}</div>
              <div style={styles.statLabel}>Sin cambios</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{summary.skipped.total}</div>
              <div style={styles.statLabel}>Filas omitidas</div>
            </div>
          </div>

          <p style={styles.hint}>
            {summary.validRows} filas válidas de {summary.totalRows} leídas en la pestaña.
          </p>

          {summary.added.length > 0 ? (
            <>
              <h2 style={styles.sectionTitle}>Agregados ({summary.added.length})</h2>
              <ul style={styles.list}>
                {summary.added.map((item) => (
                  <li key={`add-${item.rowNumber}`} style={styles.listItem}>
                    {item.label} <span style={styles.muted}>· fila {item.rowNumber}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {summary.updated.length > 0 ? (
            <>
              <h2 style={styles.sectionTitle}>Actualizados ({summary.updated.length})</h2>
              <ul style={styles.list}>
                {summary.updated.map((item) => (
                  <li key={`upd-${item.rowNumber}`} style={styles.listItem}>
                    {item.label}{" "}
                    <span style={styles.muted}>
                      · fila {item.rowNumber}
                      {item.fields?.length ? ` · campos: ${item.fields.join(", ")}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {summary.skipped.total > 0 ? (
            <>
              <h2 style={styles.sectionTitle}>Filas omitidas ({summary.skipped.total})</h2>
              <p style={styles.hint}>
                {skippedByReason
                  .map(([reason, count]) => `${REASON_LABELS[reason] ?? reason}: ${count}`)
                  .join(" · ")}
              </p>
              <ul style={styles.list}>
                {summary.skipped.rows
                  .filter((row) => row.reason !== "brand-header" && row.reason !== "empty-row")
                  .map((row) => (
                    <li key={`skip-${row.rowNumber}`} style={styles.listItem}>
                      <span style={styles.muted}>Fila {row.rowNumber}:</span> {row.detail}
                    </li>
                  ))}
              </ul>
              <p style={styles.hint}>
                Los encabezados de marca y las filas vacías se omiten por diseño y no se listan
                individualmente.
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default VehicleSyncTool;
