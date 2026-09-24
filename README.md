# Bonus Scout 100+ Offer Build

This build contains **113** source-linked signup / welcome / trial / referral opportunities.

## Data standard
- Every listing has an `official_url`.
- Every listing shows a verification date.
- Exact numerical claims are used only where we captured a current public offer from the provider.
- If an issuer personalizes or dynamically changes the offer, the site says `Live offer`, `Varies`, or `See live terms` instead of inventing an amount.
- Affiliate/referral program URLs are included only where we identified an official program page. An `affiliate_url` remains blank until you are actually approved.

## Updating GitHub
Upload these files to the root of your repo and overwrite the older copies:
- index.html
- styles.css
- app.js
- offers.json
- .nojekyll

GitHub Pages will redeploy after the commit.

## Important
This is a rapidly changing database. Re-verify offers regularly, especially sportsbooks, bank bonuses, credit-card welcome offers, and subscription trials.


## Consumer-facing cleanup
- Removed affiliate/referral-count and hosting-cost stats from the homepage.
- Removed the Partner Ready Monetization section from the public site.
- Added Visitors, Offers Completed, and Estimated Rewards Earned counters.
- See `SUPABASE_SETUP.md` to turn those into free community-wide counters.
