# Email Notifications: Inventory and Concept

Status: draft for discussion, 18 November 2026. No code has changed.

This document lists every email Social Income sends today and proposes
one path through which all of them go. It builds on the team's existing
draft in Discussion
[#3356 "Transactional Architecture"](https://github.com/orgs/socialincome-san/discussions/3356)
and only repeats it where needed; read both together.

## 1. Inventory

Legend: 🟢 live · 🟠 switched off · 🔵 open PR or planned · ❓ to
confirm with the team (lives outside the repository).

| Email                                 | Trigger                                                                                                                                                                   | Receiver                                                   | Sent from                                                                                                                                                                                      | Logged in `sent_email`                     | Languages                                                               | State                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Monthly summary                       | Vercel cron, 1st of month 08:00 (`src/app/api/v1/monthly-summary/route.ts`)                                                                                               | Staff, `MONTHLY_SUMMARY_RECIPIENTS`                        | `sendMail` → SendGrid dynamic template (ID in env), text fallback built in code                                                                                                                | Yes, text fallback only; dedupe by subject | en                                                                      | 🟢                                                                  |
| Campaign edited                       | Contributor edits own campaign in the dashboard (`campaign-edit.service.ts`)                                                                                              | Staff, `CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS`             | `sendMail`, plain text                                                                                                                                                                         | Yes                                        | en                                                                      | 🔵 PR [#3444](https://github.com/socialincome-san/public/pull/3444) |
| Campaign created                      | —                                                                                                                                                                         | —                                                          | No email exists; staff learn about new campaigns elsewhere ❓                                                                                                                                  | —                                          | —                                                                       | missing                                                             |
| Donation certificate ready            | Vercel cron, daily in January (`/api/v1/donation-certificates/annual-email`)                                                                                              | Contributors with a certificate for last year              | `sendMail`, plain text                                                                                                                                                                         | Yes; dedupe by recipient + subject         | en                                                                      | 🔵 PR [#3346](https://github.com/socialincome-san/public/pull/3346) |
| Magic login link                      | Login form in the browser (`src/components/login/send-magic-login-link.ts`)                                                                                               | Contributors, portal and partner users                     | Firebase Auth client SDK `sendSignInLinkToEmail`, Firebase Console template ❓                                                                                                                 | No                                         | Firebase default copy ❓                                                | 🟢; branded version planned in #3144                                |
| Welcome series 1–4                    | SendGrid Automations "Welcome Series (EN/DE/FR)", entered once via segments "Welcome Automation EN/DE/FR": `contributor = 'no'`, language, created after June/August 2024 | New newsletter contacts that are not marked as contributor | SendGrid Marketing, sender Aurélie, day 0, 4, 8, 12, suppression group "Welcome Emails", category `welcome`. Repo HTML in `website/emails/transactional/welcome-*` is a copy (in sync unknown) | No                                         | de, en, fr (no Italian automation, although `welcome-*-it.html` exists) | 🟢 all three re-published 16 Nov 2026                               |
| Donor welcome series                  | SendGrid Automation "Donor Welcome Series", entry segment matches one test address                                                                                        | Contributors (planned)                                     | SendGrid Marketing; day 0, 2, 5, 31: "Your donation is already on its way", "Five principles, one honest model", "There is never just one route out of poverty", "If not now, when?"           | No                                         | en                                                                      | draft in SendGrid, not in the repo                                  |
| First payout confirmation             | Legacy Firebase cron on the 16th (not in this repository any more)                                                                                                        | Contributors, about one month after the first donation     | SendGrid dynamic templates "First payout email (de/en)", last edited April 2024; HTML in `website/emails/transactional/payout-email-*` (de, en, fr, it)                                        | No                                         | de, en in SendGrid                                                      | 🟠 per #3356 and #1574                                              |
| Fundraiser start / end / thanks       | Unknown; no code references them                                                                                                                                          | Campaign creators or donors ❓                             | SendGrid dynamic templates "Fundraiser start (en)", "Fundraiser end (en)", "Fundraiser thanks for donation (en)", created Nov–Dec 2024                                                         | No                                         | en                                                                      | ❓ probably unused                                                  |
| Monthly newsletter                    | Person, manual Single Send                                                                                                                                                | Newsletter list minus suppression group                    | SendGrid Marketing; archive in `website/emails/newsletter`, built with the `monthly-newsletter` skill                                                                                          | No (SendGrid stats only)                   | en                                                                      | 🟢                                                                  |
| Campaign news                         | —                                                                                                                                                                         | Followers of a campaign                                    | Only the campaign ID is stored in the SendGrid custom field `campaign_news` (`sendgrid-subscription.integration.ts`); nothing sends yet                                                        | —                                          | —                                                                       | 🔵 #1026                                                            |
| Stripe payment receipt                | Successful card payment                                                                                                                                                   | Contributors paying by card                                | Stripe itself, if "Email customers about successful payments" is on. The code sets no `receipt_email` and sends no receipt of its own                                                          | No (Stripe dashboard only)                 | Stripe's locale handling ❓                                             | ❓                                                                  |
| Stripe failed payment / card expiring | Subscription payment fails or card expires                                                                                                                                | Contributors with a monthly donation                       | Stripe Billing customer emails, if enabled. The webhook handles `charge.failed` but sends nothing                                                                                              | No                                         | ❓                                                                      | ❓                                                                  |
| Simple template                       | —                                                                                                                                                                         | —                                                          | `website/emails/transactional/simple-template.html`, generic letter layout with placeholders, not used by code                                                                                 | —                                          | en                                                                      | draft                                                               |

Related, but not email:

- **Newsletter subscription.** `subscribeToNewsletter` adds the contact
  to the SendGrid list and removes it from the suppression group;
  unsubscribe adds it to the group
  (`src/integrations/sendgrid/sendgrid-subscription.integration.ts:40`).
  Callers: footer signup, donation wizard onboarding, dashboard profile,
  and bank-transfer contributor creation
  (`src/modules/contributors/contributor.service.ts:667`), which
  subscribes without an explicit opt-in. A new contact enters the
  welcome series unless it was created with `contributor = 'yes'`, which
  only the dashboard profile sets. So contributors who sign up through
  the donation wizard or bank transfer get the series meant for
  non-contributors.

### SendGrid setup (read via API, 18 November 2026)

- **Lists:** "Newsletter" (4,321 contacts, `SENDGRID_LIST_ID`),
  "studienstiftung" (170), "Delete later" (1). Segments by language on
  the newsletter list (English 3,544, German 216, French 13, Italian 1),
  engagement segments ("Engaged (Newsletter Click)" 743), staff and test
  segments.
- **Suppression groups:** "Monthly Newsletter" (943 unsubscribed,
  `SENDGRID_SUPPRESSION_LIST_ID`), "Welcome Emails" (52), "Transactional
  Emails" (35), "Campaign News" (0, prepared for #1026). Global
  suppressions: 168 unsubscribes, 161 bounces, 21 spam reports.
- **Automations:** the three live welcome series and the donor draft
  above. No other automation.
- **Single Sends:** 83, almost all newsletter issues plus copies and
  test sends to staff segments.
- **Dynamic templates:** `monthly-summary`, first payout (de, en),
  fundraiser start, end and thanks (en).
- **Senders:** Aurélie, Sandino and "Social Income"
  (hello@socialincome.org), all verified. Domain socialincome.org is
  authenticated (`em` subdomain).
- **Tracking:** open tracking on, click tracking off, so clicks in
  automations are only partly measurable. Categories in use:
  `newsletter` and `welcome`; API mails (monthly summary) have none.
- **Event Webhook:** disabled.
- **Volume:** about 3,600 requests in a month with a newsletter, about 2
  % blocked, under 10 bounces.
- **SMS and WhatsApp** via Twilio are logged per message in
  `MessagingJob` and `MessageLog` with delivery status. They are the
  model to copy, not part of this concept.
- **Slack alerts** for failed crons (`sendSlackAlert`).

### What the inventory shows

- Four places hold content: SendGrid dynamic templates, SendGrid
  Marketing, plain strings in TypeScript, the Firebase Console.
- `sent_email` sees only what goes through `sendMail`. It stores the
  text fallback, not what the person saw, and has no type, status or
  provider ID. Deduplication relies on subject text, which breaks when a
  subject is reworded.
- Every email built in code is English only.
- Staff emails use one env var per email for their receivers.
- Nothing tells us whether an email arrived or bounced: the SendGrid
  Event Webhook is disabled.
- The welcome logic (who enters, when) lives in SendGrid segments that
  depend on a custom field the website sets only in one of four signup
  paths.

## 2. What the Discussions say

**[#3356 Transactional Architecture](https://github.com/orgs/socialincome-san/discussions/3356)**
(Sandino, 1 November 2026, no comments yet). A full draft with the same
goal. Its main points, which this concept adopts:

- Keep SendGrid as the only provider. Move every code-triggered email
  into the repository as React Email templates; copy in next-intl locale
  files (`emails` namespace); the newsletter stays a SendGrid Single
  Send.
- Four classes with fixed rules: **authentication** (no signer, bypass
  suppression, link redacted in the log), **lifecycle** (signed by a
  person, own suppression group, never the newsletter one), **internal**
  (staff, plain), **editorial** (newsletter, SendGrid).
- Separate content, layout (_letter_, _notice_, _plain_), identity (a
  signer registry with name, translated role, portrait, reply-to) and
  delivery.
- Extend `SentEmail` with template key, category, locale, signer, a
  unique dedupe key, status, provider message ID and the rendered HTML.
- SendGrid Event Webhook at `POST /api/v1/sendgrid/events`.
- A "Messages" tab on contributor, recipient and local partner dialogs
  that merges emails and SMS per contact; richer admin page.
- Local transports (`console`, `file`), preview server, snapshot and
  screenshot tests; rate limiting and Turnstile for public triggers.
- Phased plan of 17–25 developer days; nine open decisions (sender
  addresses, From name, signers, welcome series, one-time code,
  lifecycle unsubscribe, campaign followers, look, retention).

**[#174 React as Template Engine for Emails & PDFs](https://github.com/orgs/socialincome-san/discussions/174)**
(2022, closed). Proposed React templates for payment confirmation, first
payout and failed payments; the team chose MJML in 2024. Sandino asked
for a web-view link per email. #3356 now recommends React Email instead,
because the MJML and Handlebars setup in the legacy functions was
abandoned.

Related issues: #1574 (transactional emails plan), #3144 (branded magic
link), #1984 (yearly certificate email), #1026 (campaign news).

## 3. Concept

One module through which every email the platform sends goes. It follows
#3356 and adds what this task asks for on top: an audience per type,
per-category preferences, scheduled sequences, and a campaign view.

### 3.1 Module

`src/modules/notifications` owns the registry, the log and the
preferences and exposes one function:

```ts
await sendNotification({
	type: 'campaign-created',
	to: { contactId }, // or { email } for staff and bare addresses
	data: { campaignId, title },
	related: { campaignId },
	idempotencyKey: `campaign-created:${campaignId}`,
});
```

The service validates `data` against the type's schema, checks the
opt-out rule and the idempotency key, resolves locale and signer,
renders, sends through `src/integrations/sendgrid`, and writes the log
row. It lives in the existing `src/modules/mail` module, as #3356
proposes; `sendMail` is gone.

### 3.2 Type registry

Every email is a typed entry in code:

| Field      | Values                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| `key`      | stable, e.g. `donation-thank-you`                                                                            |
| `audience` | `contributor` · `staff` · `recipient` · `partner`                                                            |
| `category` | `auth` · `transactional` · `marketing` · `internal` (maps to the #3356 classes; _transactional_ = lifecycle) |
| `optOut`   | `never` (auth, legal receipts) · `category` (follows the person's preference) · `list` (SendGrid group)      |
| `layout`   | `letter` · `notice` · `plain`                                                                                |
| `signer`   | default signer key, none for auth and internal                                                               |
| `schema`   | Zod schema of the data                                                                                       |
| `redact`   | what the log may not keep (login links, codes)                                                               |

Staff types also name their receivers through one setting per type
instead of one env var per email (`NOTIFICATION_STAFF_RECIPIENTS` plus
optional per-type overrides), so new staff emails need no new variable.

### 3.3 Log and outbox

Extend `SentEmail` (`src/lib/database/schema.prisma`) instead of adding
a second table, so the admin page and seeds keep working. New nullable
columns, backwards compatible:

| Column                                        | Purpose                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `type`                                        | registry key; null for legacy rows                                                                      |
| `category`, `locale`, `signerKey`             | what was sent and how                                                                                   |
| `status`                                      | `scheduled` · `queued` · `sent` · `delivered` · `opened` · `bounced` · `dropped` · `failed` · `skipped` |
| `scheduledFor`                                | turns a row into an outbox entry for sequences and retries                                              |
| `providerMessageId`                           | SendGrid `X-Message-Id`, matches webhook events                                                         |
| `idempotencyKey` (unique)                     | replaces subject-based dedupe                                                                           |
| `campaignId`, `contributionId`, …             | related entity, so the campaign view can query by foreign key                                           |
| `bodyHtml`, `errorMessage`, `statusUpdatedAt` | preview and troubleshooting                                                                             |

`contactId` is passed by the caller; matching by address stays the
fallback. Writes go through a `*.repository.write.ts` only if the table
becomes audited data; it is a log, so a plain repository is enough.

### 3.4 Delivery status

`POST /api/v1/sendgrid/events` verifies the signed SendGrid Event
Webhook and updates `status` by `providerMessageId`: delivered, bounce,
dropped, deferred, open, click, spamreport, unsubscribe. Opens are
unreliable (Apple Mail Privacy Protection) and shown as a hint only. A
bounce or spam report on a contact is surfaced in the portal. The Twilio
status route is the pattern.

### 3.5 Templates and translation

As in #3356: React Email templates under `src/emails`, three layouts
ported from `simple-template.html`, copy in
`src/lib/i18n/locales/<lang>/emails.json` (de, en, fr, it), loaded with
`createTranslator` and `loadMessages` in the service. Links in copy use
next-intl rich text tags. A preview (`npm run email:dev` plus a portal
page under admin that renders any type with fixtures in every language)
and snapshot tests per type and language. Each email gets a web-view
link to its archived copy (idea from #174).

### 3.6 Sequences

A sequence is a list of `{ type, delay, condition }` (for example
welcome 1 on day 0, welcome 2 on day 3). Enrolling writes `scheduled`
rows with `scheduledFor`; a Vercel cron
(`/api/v1/notifications/dispatch`, every 15 minutes, scheduler auth)
sends due rows, re-checks the condition and the person's preferences at
send time, and marks rows `skipped` when they no longer apply (e.g. skip
"become a monthly donor" for monthly donors). Same cron retries `failed`
rows with backoff.

### 3.7 Visibility in the portal

- `/portal/admin/sent-mails`: columns for type, category, language,
  status; filters by type, status and date; preview on row click; link
  to the contact.
- "Emails" tab on the contributor dialog (or "Messages" merged with SMS,
  as #3356 proposes) and on campaigns, reading by `contactId` and
  `campaignId`.
- Staff can resend a failed transactional email from the preview.

### 3.8 Preferences

Contributors manage per-category settings in the dashboard profile, next
to the existing newsletter toggle: _Newsletter_ (SendGrid group, as
today), _Updates about my donations and campaigns_ (transactional types
with `optOut: 'category'`), _Tips and stories_ (welcome series and
appeals). Auth emails and legally required ones (receipts, certificates
if they are the only copy) cannot be turned off. Stored in Postgres on
the contact, mirrored to SendGrid groups only for marketing.

### 3.9 Catalogue

Source: **T** = this task, **D** = Discussion #3356, **#n** = issue.

| Type                                           | Audience                | Category                 | Trigger                                   | Source          |
| ---------------------------------------------- | ----------------------- | ------------------------ | ----------------------------------------- | --------------- |
| Login link                                     | all users               | auth                     | login form                                | D, #3144        |
| Login one-time code                            | all users               | auth                     | login form                                | D               |
| Account created                                | portal, partner users   | auth                     | user created in portal                    | D, #1574        |
| Thank you for your donation                    | contributor             | transactional            | Stripe `charge.succeeded`, bank import    | T, #174         |
| Monthly donation started / changed / cancelled | contributor             | transactional            | subscription webhooks                     | T, D            |
| Subscription payment failed                    | contributor             | transactional            | `charge.failed` on a subscription         | T, #174         |
| First payout confirmation                      | contributor             | transactional            | payout confirmed after first contribution | D, #1574        |
| Donation certificate ready                     | contributor             | transactional            | January cron                              | T, D, #1984     |
| Welcome series 1–4                             | contributor, subscriber | marketing                | sequence on first contribution or signup  | T, D (existing) |
| Campaign created                               | staff + creator         | internal / transactional | campaign submitted                        | T               |
| Campaign edited                                | staff                   | internal                 | contributor edits campaign                | T, PR #3444     |
| Campaign approved / published                  | creator                 | transactional            | staff publishes                           | T               |
| Campaign milestone (50 %, goal)                | creator, donors         | transactional            | contribution crosses threshold            | T, D            |
| Campaign ending soon / ended                   | creator                 | transactional            | daily cron on end date                    | T               |
| Campaign news                                  | followers               | marketing                | creator or staff posts update             | D, #1026        |
| Bounce on a contributor address                | staff                   | internal                 | webhook                                   | T               |
| Monthly summary                                | staff                   | internal                 | monthly cron                              | existing        |

## 4. Migration

Small steps, each shippable on its own:

Steps 1 to 3 are implemented in the first pull request (only staff types
so far; the per-type receiver variables stay until a settings page
replaces them). Certificate ready (#3346) moves onto the new path when
that PR is rebased.

1. **Foundation with the existing emails.** Registry,
   `sendNotification`, `SentEmail` columns, idempotency key. Move
   monthly summary and campaign edited onto it, still as plain text and
   English. Removes subject-based dedupe.
2. **Campaign created** staff email: first new type, proves the
   registry.
3. **Delivery status:** SendGrid Event Webhook, status in the admin
   page.
4. **Templates:** React Email layouts, `emails` namespace, preview and
   tests; convert the three emails, then add translations.
5. **Portal views:** admin page filters and preview, "Emails" tab on
   contributor and campaign.
6. **Donation emails:** thank you, failed subscription payment, first
   payout confirmation. Decide with the team which Stripe emails to turn
   off.
7. **Auth:** branded login link (#3144) with rate limiting.
8. **Preferences and sequences:** dashboard settings, dispatch cron,
   welcome series moved from SendGrid Automation into code; then
   campaign milestone, ending and news emails.

Once a step replaces an email in SendGrid or Stripe, turn the old one
off in the same release and delete its HTML from
`website/emails/transactional`.

## 5. Open questions for the team

1. **Welcome series:** is it intended that only contacts with
   `contributor = 'no'` enter it, that wizard and bank-transfer
   contributors count as "no", and that Italian has no automation? What
   is the plan for the "Donor Welcome Series" draft, and who owns it?
2. **Template sources:** are `website/emails/transactional/*` the
   current copies of what is in SendGrid, or have they drifted? Are the
   fundraiser templates used anywhere, or can they go? Is the payout
   confirmation really off?
3. **Stripe:** are successful-payment receipts, failed-payment and
   card-expiry emails enabled in the dashboard? In which languages? Do
   we keep them or replace them with our own thank-you email?
4. **Firebase:** has the magic-link email template been customised or
   translated in the Firebase Console?
5. **Bank-transfer contributors** are subscribed to the newsletter
   without an opt-in (`contributor.service.ts:667`). Intended?
6. **Campaign created:** who should be notified, and should the creator
   get a confirmation? Is there an approval step today?
7. **Portal tab:** merge emails and SMS in one "Messages" tab or keep an
   "Emails" tab?
8. The nine decisions listed in #3356 §12 (sender addresses, From name,
   signers, welcome series in code or SendGrid, one-time code, lifecycle
   unsubscribe, campaign followers, look, retention).
9. **Preferences:** which categories, and which emails count as required
   (receipts, certificates)?
10. **Recipients:** should recipients or local partners ever get email,
    or stay on SMS and WhatsApp?
