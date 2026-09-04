# Setting up Google Calendar & Gmail sign-in

Each family member can connect their own Google account from
**Connected accounts** in the dashboard. That feature needs one set of
OAuth credentials for the whole app (not per-family, not per-user) — you
create these once as the app's administrator.

This takes about 10 minutes and is free.

## 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   sign in with any Google account.
2. Click the project dropdown at the top → **New Project**.
3. Name it something like "Family Command Center" and click **Create**.

## 2. Enable the APIs you need

1. In the left sidebar, go to **APIs & Services → Library**.
2. Search for **Google Calendar API** → click it → **Enable**.
3. Search for **Gmail API** → click it → **Enable**.

## 3. Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**.
2. Choose **External** (this app is for your family, not a Google
   Workspace organization) → **Create**.
3. Fill in an app name (e.g. "Christian Family Command Center"), your
   support email, and developer contact email. Everything else can be
   left blank.
4. On the **Scopes** step, add:
   - `.../auth/calendar.readonly`
   - `.../auth/gmail.readonly`
5. On the **Test users** step, add the Gmail address of every family
   member who will connect their account. **While the app is in "Testing"
   mode, only these listed users can connect** — this is fine for a
   private family app and avoids Google's app-review process, which is
   only required if you want the general public to use it.

## 4. Create the OAuth Client ID

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**.
2. Application type: **Web application**.
3. Name it anything.
4. Under **Authorized redirect URIs**, add the exact callback URL for
   wherever this app is running, e.g.:
   - Local development: `http://localhost:3000/api/google/callback`
   - Production: `https://your-domain.com/api/google/callback`
5. Click **Create**. Copy the **Client ID** and **Client secret** shown.

## 5. Add the credentials to this app

In your `.env` file (copy `.env.example` if you haven't yet):

```
GOOGLE_CLIENT_ID="the client id from step 4"
GOOGLE_CLIENT_SECRET="the client secret from step 4"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"
```

Restart the app after editing `.env`. The "Connect Google" button on the
**Connected accounts** page will now work for the test users you added in
step 3.

## Going to production / adding more than a handful of family members

If you outgrow the "Testing" mode's test-user list (Google caps this at
100 users, which is far more than any one family will need), you can
submit the app for **verification** from the OAuth consent screen page.
For a read-only Calendar/Gmail app this is usually a same-day approval,
but it's entirely optional for a private family tool — Testing mode works
indefinitely for a fixed list of users.

## What this app can and can't do with your Google account

This app requests **read-only** access to Calendar and Gmail:

- It can see your calendar events and mirror them into the family
  calendar, but it never creates, edits, or deletes anything on your
  actual Google Calendar.
- It can see recent email metadata and subject/snippet text to show a
  glance-able inbox preview, but it never sends, deletes, or modifies
  email.

Each member's Google connection is private to them until they explicitly
turn on "Share this calendar with the family" — see the main README.
