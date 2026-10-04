# MYRVEX — The Living Colony

Official X: https://x.com/MYRVEXsol

## Website

`index.html` is the complete self-contained public frontend: colony animation, four SOL coin colors, role gallery, responsive layout and project information. GitHub Actions publishes this file to GitHub Pages on a push to `main`. No npm installation is needed for this deployment.

If GitHub Pages has not yet been enabled, choose **Settings → Pages → Source → GitHub Actions**, then rerun **Deploy MYRVEX website**. Set your domain in the same Pages settings screen. No domain is preconfigured in this repository.

## Current product status

The official token and pool are not connected. There is no active purchase link. Coin movement is graphical and does not imply SOL revenue.

The public GitHub Pages build does not operate the database-backed reward service. Its task controls stay unavailable until a participant backend is connected. It never invents balances or stores redeemable points in local browser storage.

## Full application source

`app/`, `components/`, `lib/`, `db/`, `drizzle/`, and `public/` contain the full React/Vinext and Cloudflare D1 application, including task awards, contribution submission and owner review. The backend is not executable on GitHub Pages.

Install dependencies using `npm run install:ci`; run `npm run build` for a Cloudflare-compatible Worker build. Configure a D1 `DB` binding, apply the SQL migrations in `drizzle/`, and configure a verified authentication gateway before operating the backend on another host. The existing `oai-authenticated-user-email` header is trusted ONLY behind the original hosting gateway. A public deployment must replace it with verified user sessions or wallet-signature authentication; never accept identity headers directly from clients.

`REWARDS_ADMIN_EMAIL` controls contribution review. No secrets or production database contents are included.

## Before launching financial rewards

Publish and verify the official mint, trading pool and quote decimals; connect reliable RPC ingestion; fund and publish a reward treasury; define eligibility and season rules; implement wallet verification and reviewed claim/distribution transactions. Pre-season construction points have no cash value or guaranteed conversion. SOL claims remain closed.

## Validation

`node tests/rewards.mjs` tests authorization, daily award idempotency, quiz answers, contribution limits, review permissions and member isolation. `node node_modules/typescript/bin/tsc --noEmit` checks application types.
