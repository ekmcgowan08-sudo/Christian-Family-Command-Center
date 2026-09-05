# Setting up outbound email

Email powers two things in this app:

- **Invite emails** — if you enter an email address when inviting a family
  member, they get a real email with a link instead of you having to
  copy-paste it to them yourself.
- **Password reset** — "Forgot your password?" on the login page.

Both work fine without email configured: invites just show you a link to
copy-paste, and password reset shows a message explaining it isn't set up
yet (an owner can remove and re-invite someone who's locked out in the
meantime).

This app speaks plain SMTP, so any provider works. Two easy options:

## Option A: Resend (recommended, generous free tier)

1. Sign up at [resend.com](https://resend.com) — free tier covers a
   family's worth of email easily.
2. Verify a sending domain (or use their shared test domain to start).
3. Create an API key, then in **SMTP settings** (or their docs) find the
   SMTP credentials — Resend exposes an SMTP relay alongside their API.
4. Set:
   ```
   SMTP_HOST="smtp.resend.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="resend"
   SMTP_PASSWORD="your Resend API key"
   SMTP_FROM="Family Dashboard <noreply@yourdomain.com>"
   ```

## Option B: Gmail (simplest if you already have a Google account)

1. Turn on 2-Step Verification on the Google account you want to send
   from (required for the next step): [myaccount.google.com/security](https://myaccount.google.com/security).
2. Create an **App Password**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) →
   name it "Family Dashboard" → copy the 16-character password.
3. Set:
   ```
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="youraddress@gmail.com"
   SMTP_PASSWORD="the 16-character app password"
   SMTP_FROM="youraddress@gmail.com"
   ```
   Gmail's sending limits (500/day) are far more than a family dashboard
   needs.

## Any other provider

Postmark, SendGrid, Amazon SES, Mailgun, or your own mail server all work
the same way — set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
and `SMTP_FROM` to whatever that provider's SMTP docs give you.

Restart the app after editing `.env`. Invite emails and password reset
will start working automatically once `SMTP_HOST`, `SMTP_USER`, and
`SMTP_PASSWORD` are all set.
