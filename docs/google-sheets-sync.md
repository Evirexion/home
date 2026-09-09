# Vehicle price sync — private Google Sheet → Sanity

The vehicle master list (`EVirexion_Guia_de_Precios`, 189 vehicles) lives in a
private Google Sheet. A button inside Sanity Studio pulls it in on demand:
new vehicles are created, changed ones updated, identical ones left alone.

**The sheet stays private.** Nothing here uses a public "anyone with the link"
export URL. Access goes through the Google Sheets API v4, authenticated as a
service account that the sheet is shared with individually — exactly like
sharing it with a coworker, except the coworker is a robot with read-only access.

## How the pieces fit

```
Sanity Studio  ──POST /api/sync-vehicles──>  Next.js route (Cloudflare Worker)
 (public JS,       + bearer secret            │
  no secrets)                                 ├─> Google Sheets API (service account)
                                              └─> Sanity write API (create/patch)
```

The service account key never reaches the browser. The Studio is a client-side
app whose JavaScript anyone can download, so it only knows the endpoint URL —
the credentials live in the Worker's environment. The sync secret is typed into
the Studio tool once by the operator and kept in their own browser's
`localStorage`, so it is never compiled into the published Studio bundle either.

---

## Step 1 — Create a Google Cloud project and enable the Sheets API

1. Go to <https://console.cloud.google.com/projectcreate>.
2. **Project name**: `evirexion-sheets-sync` (anything works). Click **Create**
   and wait for the notification that it's ready, then make sure it's selected
   in the project picker at the top of the page.
3. Go to **APIs & Services → Library**, or straight to
   <https://console.cloud.google.com/apis/library/sheets.googleapis.com>.
4. Search for **Google Sheets API**, open it, and click **Enable**.

You do **not** need to enable the Drive API, configure an OAuth consent screen,
or set up billing — a service account reading one sheet needs none of that.

## Step 2 — Create a service account and download its JSON key

1. Go to **APIs & Services → Credentials**
   (<https://console.cloud.google.com/apis/credentials>).
2. Click **Create credentials → Service account**.
3. **Service account name**: `evirexion-sheet-reader`. Google fills in an ID and
   shows the email it will get, something like
   `evirexion-sheet-reader@evirexion-sheets-sync.iam.gserviceaccount.com`.
   **Copy that email — you need it in step 3.**
4. Click **Create and continue**. When it asks to *grant this service account
   access to the project*, skip it (**Continue**), then **Done**. Project-level
   IAM roles are about Google Cloud resources; access to the sheet itself is
   granted by sharing the file, which is the next step.
5. Open the new service account → **Keys** tab → **Add key → Create new key** →
   choose **JSON** → **Create**. A `.json` file downloads.

That file is a credential: treat it like a password. Don't commit it, don't
paste it into chat or a ticket. If it leaks, delete the key from this same Keys
tab and create a new one.

## Step 3 — Share the sheet with the service account (not publicly)

1. Open the sheet:
   <https://docs.google.com/spreadsheets/d/1cS6Fbuh3_GxGaczSV9ZI_AcJ94C1R-loHZ7XUz_DzFs/edit>
2. Click **Share**.
3. Paste the service account email from step 2 into the people field.
4. Set its role to **Viewer** — the sync only ever reads, and it requests the
   read-only Sheets scope, so Editor access would be more than it can use.
5. Untick **Notify people** (a service account has no inbox) and click **Share**.

Leave general access as **Restricted**. The sheet stays private; only the named
people and this one service account can open it.

## Step 4 — Store the credentials as secrets

The JSON key is easiest to handle base64-encoded — it's a single line with no
newlines or quotes to mangle. From the folder where the key downloaded:

```bash
base64 -w0 evirexion-sheets-sync-abc123.json    # Linux
base64 -i  evirexion-sheets-sync-abc123.json    # macOS
```

Also generate the shared secret the Studio button will send:

```bash
openssl rand -hex 32
```

### Production (Cloudflare Worker)

Set them as encrypted secrets — `wrangler secret put` prompts for the value and
stores it encrypted, so it never lands in `wrangler.jsonc` or in git:

```bash
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY   # paste the base64 blob
npx wrangler secret put VEHICLE_SYNC_SECRET          # paste the openssl output
npx wrangler secret put SANITY_API_WRITE_TOKEN       # if not already set
npx wrangler secret put VEHICLES_SPREADSHEET_ID      # or keep in .env / vars
npx wrangler secret put VEHICLES_SHEET_GID
```

### Local development

Copy `.env.example` to `.env.local` and fill in the same values. `.env*` is
gitignored, so nothing is committed.

### Studio

Copy `studio/.env.example` to `studio/.env` and point
`SANITY_STUDIO_SYNC_ENDPOINT` at the deployed route, e.g.
`https://e-virexion.evirexion.workers.dev/api/sync-vehicles`. That file holds no
secrets — a URL is not sensitive, and everything prefixed `SANITY_STUDIO_` is
bundled into public JavaScript.

---

## Running a sync

1. Open Sanity Studio and pick **Sincronizar vehículos desde Sheet** in the top nav.
2. Paste the `VEHICLE_SYNC_SECRET` value once. It's remembered in that browser.
3. Leave **Simular sin escribir (dry run)** ticked for the first run. This reads
   the sheet and shows exactly what *would* change without writing anything.
4. Review the summary, untick dry run, and click **Sincronizar ahora**.

The summary reports, per run:

| Section | Meaning |
| --- | --- |
| **Agregados** | Rows with no matching Sanity document — created |
| **Actualizados** | Matched documents whose values differ — patched, listing which fields changed |
| **Sin cambios** | Matched and identical — not touched at all |
| **Filas omitidas** | Skipped rows, grouped by reason |

## How rows are read

Vehicles are matched to Sanity documents on **Marca + Modelo** (case- and
accent-insensitive). New documents get a deterministic id derived from that same
pair (`vehicle-byd-seagull`), so re-running can't create duplicates.

Column positions are read from the header row **by name**, not hardcoded — the
sheet has a blank spacer column between *Precio Sugerido (COP)* and *Fuente*,
and reading by name means that (and any future column reshuffle) doesn't break
the parser.

A row is treated as a vehicle only when **both Marca and Modelo are non-empty**.
Everything else is skipped and reported rather than crashing the run:

| Reason | Example |
| --- | --- |
| `brand-header` | The merged per-brand rows (`BYD` alone above its models) — expected, not an error |
| `empty-row` | Blank spacer rows |
| `missing-brand` / `missing-model` | Half-filled rows |
| `unknown-category` | *Categoría* isn't one of the known values |
| `duplicate` | The same Marca + Modelo appears twice in the sheet; the later row is skipped |

Brand headers and blank rows are counted but not listed individually, so a
normal run doesn't look alarming — roughly 50 of the ~240 rows are brand headers.

**Categories** map to the `vehicleListing.vehicleType` enum:
`Carro` → `car`, `Bus` → `bus`, `Moto / Scooter` → `motorcycle`,
`Bicicleta Eléctrica` → `e-bike`, `Patineta Eléctrica` → `scooter`.

**Prices** parse from the `$79M – $85M` style into `priceMin` / `priceMax` in
COP. A single value (`$2.1M`) sets both; `N/D` or an empty cell leaves both
null. The `M` suffix is read as millions, with `.` as a decimal separator.

## Troubleshooting

| Message | Fix |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_KEY no está configurada` | The secret isn't set on the Worker — see step 4 |
| `No se pudo abrir el Sheet (403)` | The sheet isn't shared with the service account email — step 3 |
| `No se pudo abrir el Sheet (404)` | Wrong `VEHICLES_SPREADSHEET_ID` |
| `Google rechazó las credenciales` | Sheets API not enabled (step 1), or the key was deleted/disabled |
| `No se encontró la pestaña con gid …` | Wrong `VEHICLES_SHEET_GID`; the error lists the available tabs and their gids |
| `No autorizado` | The secret typed into the Studio doesn't match `VEHICLE_SYNC_SECRET` |
| `Sanity no está conectado para escritura` | `NEXT_PUBLIC_SANITY_PROJECT_ID` or `SANITY_API_WRITE_TOKEN` missing |

## Rotating or revoking access

- **Key compromised**: delete it under the service account's **Keys** tab and
  create a new one; the old key stops working immediately.
- **Stop all access**: remove the service account from the sheet's Share dialog,
  or disable the service account in Google Cloud.
- **Sync secret compromised**: `npx wrangler secret put VEHICLE_SYNC_SECRET` with
  a fresh value; operators re-enter it in the Studio tool next time.
