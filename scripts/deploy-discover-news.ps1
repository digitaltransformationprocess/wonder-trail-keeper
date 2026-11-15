# Deploy discover-news to the AI Discov Supabase project (oqgqdvsasfazpsocffsn).
# Does NOT run automatically — execute this script yourself when ready.
#
# Prerequisites:
#   1) Node.js + npm
#   2) Logged in: npx supabase login
#   3) Secrets already set in Dashboard (or via secrets set below):
#        FIRECRAWL_API_KEY, INGEST_CRON_SECRET
#        optional: GROK_API_KEY / XAI_API_KEY for reformulation
#
# Usage (PowerShell, from repo root):
#   .\scripts\deploy-discover-news.ps1

$ErrorActionPreference = "Stop"
$ProjectRef = "oqgqdvsasfazpsocffsn"

Write-Host "Linking project $ProjectRef ..."
npx supabase link --project-ref $ProjectRef

Write-Host "Deploying discover-news (verify_jwt=false; auth is enforced in-function) ..."
npx supabase functions deploy discover-news --project-ref $ProjectRef --no-verify-jwt

Write-Host ""
Write-Host "Done. Smoke-test (staff session or cron secret):"
Write-Host "  node scripts/smoke-discover-news.mjs"
Write-Host ""
Write-Host "Optional secrets (uncomment / fill as needed):"
Write-Host "  npx supabase secrets set FIRECRAWL_API_KEY=YOUR_KEY --project-ref $ProjectRef"
Write-Host "  npx supabase secrets set INGEST_CRON_SECRET=YOUR_SECRET --project-ref $ProjectRef"
Write-Host "  npx supabase secrets set GROK_API_KEY=YOUR_KEY --project-ref $ProjectRef"
