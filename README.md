# CSR Year 7 - Trip Control (Cloudflare Workers + D1)

This source deploys to the existing Cloudflare Worker: https://csr7-trip-control-uat.chief-henley.workers.dev/

## Deploy / CI
- Worker: csr7-trip-control-uat; D1 binding: DB (existing database).
- Run npm ci && npm run check before deployment; use npm run deploy.
- Connect this Git repository to the existing Worker in Cloudflare Settings > Builds.
- Never commit guest data, export/backup SQL, credentials, or .wrangler state.

## Sync policy
Initial load fetches central data once. While page is open, refresh at 08:00 and 17:00 Asia/Bangkok. Manual button allows refresh anytime. Writes on guest action are immediate.
