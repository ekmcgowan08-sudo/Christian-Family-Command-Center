# Backing up and restoring

Everything this app knows — every family, login, calendar event, invite,
and connected-account token — lives in one Postgres database. There's no
separate file storage to worry about (the printable resources under
`public/resources/` ship with the app itself and never change at
runtime). Back up that one database and you've backed up everything.

## If you're on a managed Postgres (Vercel, Railway, Render, Neon, etc.)

These platforms take automatic backups/snapshots of their own managed
Postgres by default — check your platform's dashboard for retention
settings and how to restore from one. That's usually the easiest and
most reliable option if you're already paying for managed Postgres, and
needs no setup here.

The steps below are for anyone self-hosting Postgres themselves (the
`docker compose up` path), where nothing is backing the database up
unless you set it up.

## Manual backup

With the stack running via `docker compose up`:

```bash
docker compose exec db pg_dump -U family family_command_center > backup-$(date +%F).sql
```

That's a plain SQL dump — portable, human-readable, and restorable into
any Postgres version at or above the one that created it. Store it
somewhere other than the same machine (another disk, cloud storage, even
emailing it to yourself) — a backup that lives next to the database it's
backing up doesn't protect against the machine itself failing.

## Restoring

```bash
# Stop the app so nothing writes to the database mid-restore.
docker compose stop app

# Drop and recreate the database, then load the dump.
docker compose exec db psql -U family -d postgres -c "DROP DATABASE family_command_center;"
docker compose exec db psql -U family -d postgres -c "CREATE DATABASE family_command_center;"
docker compose exec -T db psql -U family -d family_command_center < backup-2026-09-15.sql

docker compose start app
```

Restoring replaces every family's data with whatever was in the dump —
there's no per-family restore, since it's one shared database. Test a
restore somewhere other than your live deployment at least once before
you need it for real.

## Automating it

A daily cron job on the host running Docker Compose is the simplest way
to not have to remember:

```bash
# /etc/cron.d/family-command-center-backup, or your user crontab
0 3 * * * cd /path/to/webapp && docker compose exec -T db pg_dump -U family family_command_center | gzip > /path/to/backups/backup-$(date +\%F).sql.gz
```

Pair it with something that copies those files off the machine
periodically (`rclone`, `restic`, a cheap cloud storage sync, or even a
scheduled `scp` to another machine) and with pruning old backups so the
disk doesn't fill up — how much history to keep is a judgment call, but
even keeping the last 7-14 daily backups is far better than none.
