# Plot to Ghar

Dedicated repository for a private plot-purchase-to-building-completion finance and evidence manager.

## Applications
- `web/`: Next.js PWA + API deployed to Vercel Hobby.
- `android/`: hardened native Android WebView shell pointed at the stable Vercel production domain.

## Production architecture
- **GitHub**: source control and CI.
- **GitHub Actions**: financial integrity checks, TypeScript/build validation and Android APK artifacts.
- **Vercel Hobby**: web/PWA hosting and server API.
- **Neon Postgres free tier**: durable project configuration, immutable transactions, audit trail, login throttling and restore points.
- **Private S3-compatible object storage**: receipts, PDFs and construction evidence.
- **Browser local storage + service worker**: offline snapshot and transaction outbox.

Core operation does not require a paid service.

## Financial invariants
- Funding is never an expense.
- Bank → cash is a transfer and never increases project cost.
- Contractor advances remain advances until explicitly adjusted.
- Refunds reduce recognized project cost.
- Loan repayments reduce available cash but do not inflate construction cost.
- Corrections are appended as reversal entries; original financial records are never destructively edited.
- Duplicate transaction protection runs before cloud posting.
- Backup restore creates a server-side restore point first.

## Current lifecycle
The app starts at **Plot Locked / Registry Pending** and continues through:
1. Registry and acquisition.
2. Possession and mutation.
3. Design/pre-construction.
4. Phase-wise building construction.
5. Materials, vendors and contractors.
6. Finishing and project completion.

## Android release signing
The CI workflow always creates an installable APK. For a stable production signature across upgrades, configure these GitHub Actions secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Without these secrets the release APK is intentionally signed with the Android debug key and is suitable for direct testing, not long-term store/update distribution.

## Production environment
Server credentials stay in Vercel project environment variables/integration credentials and are never committed to GitHub.

Required application variables:
- `DATABASE_URL`
- `APP_PIN`
- `SESSION_SECRET`

Object storage variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ENDPOINT_URL_S3`
- `AWS_REGION`
- `AWS_SESSION_TOKEN` when required
- `OBJECT_STORAGE_BUCKET`

## Health
`GET /api/health` returns database/storage configuration status and application version without exposing credentials.

## Construction Studio v2.5.1
- Floor-wise budgets for ground-floor shops/parking, first floor and terrace. Floor built-up area must be entered from drawings; it is never assumed equal to plot area.
- Rough concrete/brickwork quantity estimator; **not structural design**, purchase quantity must be approved by engineer.
- Construction tasks with dates, dependencies, floor, phase, contractor and cost forecast.
- Material inventory receipt, issue, wastage, vendor return and manual reconciliation. Stock movements never post ledger expenses. Existing material purchase transaction can be linked for traceability.
- Contractor agreements: scope, value, advance ceiling, payment terms, retention, optional signed document.
- Site-photo progress diary: attachments, milestone/floor/date/progress, included in standalone full backups.
- Loan EMI and extra-payment simulation using manually verified outstanding principal; six-month scheduled-work/cash forecast based on actual project account balances, not undisbursed loan commitments.
- Local reminders: EMI, contractor payment, delivery and site work. The Android shell schedules **inexact** local device notifications, rearmed after reboot, subject to Android permissions/energy restrictions. Website browser notifications fire only while the app is open. Remote web push is not configured.
- Free Tesseract OCR for printed English receipt images; first language-data download needs internet. OCR results go to an **editable** expense draft, never auto-post.

### Cost integrity & migration
State normalization migrates V2 records additively. No migration deletes old transactions. Construction plans, estimates, stock movement, contracts and photos do not modify the ledger without an explicit independently validated transaction. Local backup captures photos attached to transactions, contractor agreements and progress entries. Use backup before installing major updates.

### Remaining infrastructure gaps
Cloud/multi-device sync requires a configured database and object store; existing default remains local IndexedDB with export/restore. Android APK uses debug fallback signing if permanent keystore secrets are unavailable. Server-pushed web notifications and unattended cloud reminders are not available without push subscription storage/credentials.

## Repository migration (1 Nov 2026)

The application was migrated from [`kumarPint00/junk/plot-to-ghar`](https://github.com/kumarPint00/junk/tree/main/plot-to-ghar), using source commit `c2eee503370c78369631269ee8005126f00a1a92`. The original remains intact as a rollback/reference copy; this snapshot does not replicate Git commit history.

- New source repository: [`kumarPint00/plot-to-ghar`](https://github.com/kumarPint00/plot-to-ghar).
- Deploy web on Vercel with **Root Directory `web`**, Framework **Next.js**, Build Command `npm run build`.
- Move the existing Vercel project's Git source to this repository only after verifying the new branch and preserving its existing environment variables. Migrating Git source does **not** migrate production database credentials or existing local IndexedDB data.
- Android WebView continues loading `https://plot-to-ghar.vercel.app` while the domain remains unchanged.
- Production health/smoke checks are intentionally manual until the existing Vercel production project is re-linked to this repository.

## Web UI

Web is already implemented as a responsive Next.js PWA. The web app includes project dashboard, property journey, construction studio, editable project controls, budget and loan screens, materials, evidence library, reports, reminders, and append-only financial ledger. Run `cd web && npm install && npm test && npm run typecheck && npm run build`.
