# Turn on the real Bonus Scout community counters (free)

The website is already coded for these three counters:

1. **Visitors** — unique browsers that have loaded Bonus Scout.
2. **Offers completed** — unique browser + offer combinations marked Completed.
3. **Est. rewards earned** — total Scout Value for those completed offers.

The third number is intentionally labeled *estimated*. Bonus Scout cannot independently verify that a provider actually paid a user.

## 1. Create a free Supabase project
Go to https://supabase.com and create a project.

## 2. Create the two tables
In Supabase:
- Open **SQL Editor**
- Create a new query
- Paste the entire contents of `supabase-counters.sql`
- Click **Run**

## 3. Copy the website keys
In your Supabase project:
- Go to **Project Settings → API**
- Copy the **Project URL**
- Copy the **anon / public key**

Do NOT put a service-role key in a public website.

## 4. Paste those into `config.js`

```js
window.BONUS_SCOUT_CONFIG = {
  SUPABASE_URL: "https://YOURPROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_PUBLIC_ANON_KEY"
};
```

## 5. Upload the updated files to GitHub

Replace:
- `index.html`
- `styles.css`
- `app.js`

Add:
- `config.js`

The SQL/setup files can stay in your repository or be kept privately; the website does not need them to render after setup.

## What happens before Supabase is connected?
The site says **Preview mode** and displays counts based only on the current browser. It does not pretend those are global user totals.

## Future improvement
Once Bonus Scout has actual payout integrations or user confirmations, the third metric could become verified rewards rather than estimated Scout Value.
