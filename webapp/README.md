# Christian Family Command Center — Web App

A private, password-protected dashboard each family logs into. Every
member gets their own login; each member can optionally connect their own
Google account (Calendar + Gmail) and choose whether to share it with the
rest of the family. The family's combined calendar is also exposed as a
private feed that iOS and Android phones can subscribe to directly.

## Stack

- **Next.js 16** (App Router, Server Actions) + React 19 + TypeScript
- **PostgreSQL** via **Prisma 6**
- **Auth.js (NextAuth v5)** — email/password login, JWT sessions
- **googleapis** — a separate, per-user OAuth connection for Calendar/Gmail
  (independent of login)
- **ics** — generates the family's `.ics` / webcal calendar feed
- Tailwind CSS v4

## How the pieces fit together

- **Family** is the tenant. Every user, event, and invite belongs to one.
- **User** is one family member's login (name, email, password hash,
  role `OWNER` or `MEMBER`). There is no single shared family account —
  everyone signs in as themselves.
- **GoogleAccount** is a member's own connected Google account (OAuth
  tokens), separate from login. It has a `shareCalendar` flag the member
  controls themselves — off by default, so connecting Google never
  exposes anything to the family until the member opts in.
- **CalendarEvent** rows are the family's shared calendar: either typed in
  directly (`source: MANUAL`) or mirrored in from a member's shared Google
  Calendar (`source: GOOGLE`, re-synced on demand).
- **Invite** is a one-time code an owner generates so a new member can
  join with their own email/password — see `/dashboard/family`.
- The `.ics` feed (`/api/feed/[token].ics`) is intentionally
  unauthenticated — that's how phone calendar apps subscribe to it. Its
  security comes from `Family.icsToken` being a long random secret, which
  can be regenerated from Settings if it ever leaks.

## Local setup

1. **Install dependencies.** This project currently needs
   `--legacy-peer-deps` (see [Known quirks](#known-quirks-of-this-nextjsprisma-vintage) below):

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Postgres.** Any Postgres 14+ works. Easiest with Docker:

   ```bash
   docker run -d --name family-db -e POSTGRES_PASSWORD=devpassword \
     -e POSTGRES_DB=family_command_center -p 5432:5432 postgres:16-alpine
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Fill in `DATABASE_URL` to match step 2, and generate an `AUTH_SECRET`:

   ```bash
   npx auth secret
   ```

   Leave the `GOOGLE_*` variables blank for now — the app runs fine
   without them; the "Connect Google" button just stays disabled with an
   explanatory message until they're set. See
   [`docs/GOOGLE_SETUP.md`](docs/GOOGLE_SETUP.md) when you're ready to
   turn that on.

4. **Run the database migration:**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Visit <http://localhost:3000>, click **Set up your family**, and
   create the first (owner) account.

## Deploying

This app is a standard Next.js + Postgres app and isn't tied to any one
host. Three straightforward options:

- **Docker / self-hosted VPS:** `docker compose up --build` (see
  `docker-compose.yml`) starts both Postgres and the app. Set `AUTH_SECRET`
  and `NEXTAUTH_URL` (your real domain) as environment variables before
  running it, and the `GOOGLE_*` ones once you've done the Google setup.
- **Vercel / Railway / Render:** point the platform at this `webapp/`
  directory, add a managed Postgres instance, set the same environment
  variables from `.env.example` in the platform's dashboard, and set the
  build command to run `npx prisma migrate deploy` before `next build`
  (or run it once manually against the production database).
- Whichever you choose, update `GOOGLE_REDIRECT_URI` (and the matching
  entry in Google Cloud Console) to your real domain — it must exactly
  match `https://your-domain.com/api/google/callback`.

## Known quirks of this Next.js/Prisma vintage

This project was built against a very new Next.js (16.3) and an in-flux
Prisma release line. A couple of things worth knowing if you touch
dependencies:

- `npm install` needs `--legacy-peer-deps` — the plain resolver hits an
  unrelated npm/arborist crash on this dependency graph
  (`Cannot read properties of null (reading 'edgesOut')`), not something
  wrong with this project's own dependencies.
- Prisma is pinned to the `6.19.3` line deliberately. `7.x` and `8.x`
  release lines were prereleases at the time this was built and moved
  `datasource.url` out of `schema.prisma` into a separate
  `prisma.config.ts` with a different driver-adapter setup — a real
  breaking change, not a mistake to "fix" back to the old schema style.
  Revisit the pin once Prisma 7 is the stable line if you want the newer
  config style.
- The route-protection file is `src/proxy.ts`, not `middleware.ts` —
  Next.js 16 renamed the convention. Don't recreate a `middleware.ts`
  file; it's deprecated in this version.

## Resources

`/dashboard/resources` serves a handful of the printable planners and
trackers from the project's product archive (`public/resources/`) as
direct downloads.
