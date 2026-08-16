# Invitio — Online Invitation Maker

Design, customize, share and track digital invitations for weddings, birthdays, baby
showers, corporate events and more — no design skills required. Built from the
product requirements in `project-requirements.html` (Online Invitation Maker, v1).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4)
- **PostgreSQL 16** via Docker
- **Prisma 7** ORM (driver adapters + generated client)
- **NextAuth v5** (email/password, JWT sessions)
- **Zod** validation, **qrcode** for QR generation, `next/og` for link previews

## Quick start

```bash
# 1. Start PostgreSQL (Docker)
docker compose up -d

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env   # defaults work for local dev

# 4. Create the database schema + seed templates and a demo account
npm run db:migrate
npm run db:seed

# 5. Run it
npm run dev            # http://localhost:3000
```

> **Note:** Prisma 7 stores connection config in `prisma.config.ts` and generates the
> client into `lib/generated/prisma`. After changing the schema run
> `npm run db:migrate` (it regenerates the client automatically).

### Demo account

The seed script creates a demo host and a live wedding invitation:

| | |
|---|---|
| Email | `demo@invitio.app` |
| Password | `demo1234` |
| Live invitation | http://localhost:3000/i/raka-and-aisyah-wedding |

## Features

### Guest-facing invitation page (`/i/[slug]`)
- Themed rendering from the chosen template (colors + fonts, 8 seeded templates)
- Live countdown to the event
- Add-to-calendar: Google Calendar, Outlook and downloadable `.ics`
- RSVP form (yes / maybe / no, guest count, meal options, custom questions, note)
  — no guest account required; duplicate submissions update the same response
- Guestbook wishes shown on the page
- Gift section with masked account numbers (tap-to-reveal) + copy + QR codes
- WhatsApp / email / copy-link sharing + QR code of the invite link
- English / Bahasa Indonesia toggle (persisted per visitor)
- Optional access-code protection for private events (signed cookie, not exposed to guests)
- Open Graph image + `noindex` so invitation pages stay out of search engines

### Host dashboard
- Invitation list grouped by Published / Drafts / Past, with publish, duplicate,
  preview and delete actions
- Template gallery with category filters, one-click "Use this template"

### Editor (`/invitations/[id]/edit`)
- Live phone-frame preview while you edit
- Tabs: **Details** (title, date/time + timezone, location + map link, dress code,
  RSVP deadline, description, default language), **Design** (colors + fonts with
  reset-to-template), **Sections** (countdown/calendar/guestbook/gift toggles, meal
  options, custom questions), **Gifts** (bank / e-wallet accounts), **Settings**
  (slug, access code, co-hosts, publish, delete)

### RSVP management (`/invitations/[id]/guests`)
- Live stats: attending / maybe / declined / pending
- Guest list with CSV import (name, email, phone) and CSV export
- Pending list with one-click reminder text + email reminder links
- Responses table with meal choices and notes
- Gift tracker (cash / physical / other, thank-you-sent tracking)
- Guestbook wishes wall with delete

### Automated RSVP reminders
- **Scheduled:** enable *Automated reminders* in the editor Settings tab, pick how many
days before the RSVP deadline to send, and call the cron endpoint on a schedule.
  Guests who haven't responded are emailed once (tracked per guest, so no spam):

  ```bash
  curl -X POST https://your-app.com/api/cron/reminders \
       -H "Authorization: Bearer $CRON_SECRET"
  ```

  Wire it to any cron service — e.g. Vercel Cron via `vercel.json`:

  ```json
  { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 9 * * *" }] }
  ```

  or a system/cloud cron (cron-job.org, GitHub Actions) hitting the URL daily.
- **Manual:** the guests dashboard has an *Email pending* button that sends reminders
  immediately to all pending guests with an email on file.
- Emails dry-run to the console until you add a `RESEND_API_KEY`.

### Co-hosts
Invite a partner or organizer by email. They get editing access once they sign in
with the same email.

## Project layout

```
app/
  actions/          # Server actions (auth, invitations, guest RSVPs, management)
  api/auth/         # NextAuth handler
  api/ics/[slug]/   # .ics calendar download
  api/og/[slug]/    # Open Graph image for link previews
  i/[slug]/         # Guest-facing invitation page
  invitations/[id]/ # Editor + guests dashboard
  dashboard/        # Host dashboard
  templates/        # Template gallery
components/
  invite/           # Invitation rendering (view, RSVP form, countdown, gifts…)
  editor/           # Editor panels + client
  guests/           # RSVP dashboard tabs
  site/ ui/         # App shell + UI primitives
lib/
  generated/prisma/ # Generated Prisma client (do not edit)
  templates.ts      # Template catalog + theme system
  i18n.ts           # EN/ID translations
  calendar.ts       # Calendar links + .ics builder
  mailer.ts         # Email helper (Resend, dry-runs to console without a key)
prisma/
  schema.prisma     # Data model
  seed.ts           # Templates + demo data
```

## Configuration

`.env.example` documents every variable. Highlights:

- `DATABASE_URL` — Postgres connection string (docker-compose defaults provided)
- `AUTH_SECRET` — NextAuth session secret (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` — base URL used for share links, QR codes and OG tags
- `RESEND_API_KEY` — optional; enables real transactional email (RSVP confirmations,
  host notifications and reminders). Without it, emails are logged to the console.
- `CRON_SECRET` — bearer token protecting `/api/cron/reminders`

## Out of scope for v1 (per PRD)

- Scheduled reminder automation (WhatsApp Business API) — v1 ships manual reminder
  text + email links
- In-app payment processing for gifts — v1 is display + copy of account details
- Seating charts, vendor marketplace, native mobile apps
- Paid tiers / watermarking (monetization is proposed, not implemented)
