#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity

![Social Income Logo](https://github.com/socialincome-san/public/assets/6095849/e33d03b3-7502-46cc-bfe8-f70ff4374a0e)

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

## Social Income is a radically simple solution in the fight against poverty. The global open-source initiative converts donations into an unconditional basic income, which is sent directly to the mobile phones of people living in poverty in the Global South.

### ![SDG Icon](https://i.imgur.com/LHoR8Et.png) [SDG 1](https://sdgs.un.org/goals/goal1) &nbsp;&nbsp; ![SDG Icon](https://i.imgur.com/LHoR8Et.png) [SDG 10](https://sdgs.un.org/goals/goal10)

# Social Income – Monorepo Overview

Welcome to the **Social Income monorepo**.

---

# 📁 Repository Structure

```
/
├─ recipients_app/        → Mobile app for recipients
├─ recipients_selection/  → Verifiable draw process for selecting recipients
├─ seed/                  → Firebase emulator seed data
├─ shared/                → Shared code (being merged into /website)
├─ ui/                    → Legacy Storybook component library
└─ website/               → Next.js (public site, portal, dashboard, infra, backend services)
```

---

# 📱 recipients_app

Mobile app where recipients can:

- Log in
- View payment history
- Complete surveys

See `/recipients_app/README.md` for platform‑specific setup.

---

# 🎲 recipients_selection

Implements the **cryptographically verifiable and bias‑proof recipient
draw**:

- Raw recipient lists → salted → hashed → committed to `/lists`
- GitHub Action triggers `draw.sh`
- Draw randomness comes from **drand** → https://drand.love
- Results written to `/draws`
- Draws are reproducible using **dchoose** →
  https://github.com/drand/dchoose
- Full transparency explanation:  
  https://socialincome.org/transparency/recipient-selection

---

# 🌱 seed

Contains seed data for the local development environment:

- Firebase Authentication Emulator
- Firebase Storage Emulator

Automatically imported when running `mise dev`.

---

# 🔗 shared

Temporary shared library (TS/Node).  
Will eventually be migrated into `/website`.

---

# 🎨 ui (Storybook Components)

Legacy UI component package using:

- Tailwind CSS
- shadcn/ui

📘 Storybook preview: **http://design.socialincome.org**

The long‑term plan is to phase this out and maintain all components
inside `/website`.

---

# 🌐 website (Main Next.js Application)

A Next.js project containing:

### **1. Public Website**

- Currently partly hardcoded
- Migration underway → **Storyblok CMS**
- Journal already uses Storyblok  
  Docs: https://www.storyblok.com/docs

---

### **2. Portal**

Internal operations tool:

- Program management
- Payments & transfers
- Recipients & contributor tools
- Admin functions

---

### **3. Dashboard**

Contributor self‑service area:

- View payments
- Manage subscriptions
- Update personal details

---

### **4. Infrastructure (`/infra`)**

Infrastructure-as-code via **Terraform**:

- GCP Cloud Run
- GCP Cloud SQL (PostgreSQL)
- Networks, service accounts, secrets, etc.

Docs: https://developer.hashicorp.com/terraform/docs

---

### **5. Backend Services (`website/lib/`)**

Shared backend modules using:

- **Prisma ORM** → https://www.prisma.io
- **PostgreSQL**
- **Firebase Storage**
- Misc. utilities and API integrations

---

# 🛠 Local Development Setup (Simple & Minimal)

We use:

- **mise-en-place** → https://mise.jdx.dev
- **Docker** (for PostgreSQL)
- **Firebase Emulators**
- **Node.js + npm**
- **Terraform** (infra work only)

---

## 1. Install mise

```
brew install mise
```

---

## 2. Install all required tool versions

```
mise install
```

---

## 3. Start the complete local dev environment

```
mise dev
```

This starts:

- **Local PostgreSQL** via Docker Compose
- **Firebase Emulators** (Auth + Firestore + Storage)
- **Next.js website** (public site, portal, dashboard)

---

## 4. Running individual tools

Website:

```
mise run website
```

or

```
npm run website:serve
```

Mobile app:

```
cd recipients_app
# follow README
```

---

# 🧪 pg_dump / pg_restore

Useful commands for copying local DB → staging (or vice versa).

### Dump your local database:

```
pg_dump -Fc --no-owner "postgresql://social-income:social-income@localhost:5432/social-income" > local.dump
```

### Restore into staging:

```
pg_restore   --clean --if-exists   --no-owner   -d "postgresql://staging-website_google_sql_user:xxxx@yyyy:5432/staging-website-google-sql-database"   local.dump
```

---

# 🧩 Storyblok Development

1. Read the Storyblok docs → https://www.storyblok.com/docs
2. Set env vars in `website/.env.local`:
   - `STORYBLOK_PREVIEW_TOKEN`
   - `STORYBLOK_PREVIEW_SECRET`
3. Optional: run SSL proxy for live preview

```
npm run dev:ssl-proxy
```

---

# 🙋 Troubleshooting

### Translations not updating?

```
rm -rf website/.next
mise dev
```

### Firebase seed not updating?

```
npm run firebase:export
```

---

# Financial Contributions

### Donate 1 Percent of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social
Income (tax-deductible in Switzerland).

### Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/socialincome-san) and
help ensure the development of open source software for more equality
and less poverty. Donations through the GitHub Sponsor program are used
for building a strong developer community.

# Social Income (NGO)

### Non-Profit Organization

Social Income is a non-profit association
([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695))
based in Zurich, Switzerland. Connect with us
[X](https://twitter.com/so_income),
[Insta](https://instagram.com/so_income),
[LinkedIn](https://www.linkedin.com/company/socialincome),
[Facebook](https://facebook.com/socialincome.org) or by
[email](mailto:hello@socialincome.org).

### Radical Transparency

We believe that transparency builds trust and trust builds solidarity.
This is why we disclose our
[finances](https://socialincome.org/transparency/finances/usd) to the
public.

### Open Source Community

Open Source isn’t an exclusive club. It’s made by people just like you.
These individuals, amongst many others, have made significant
contributions to Social Income's success:

[![Contributors](https://contrib.rocks/image?repo=socialincome-san/public&columns=10)](https://github.com/socialincome-san/public/graphs/contributors)

### Software and IP Contributions

We receive in-kind donations from
[Google Nonprofit](https://www.google.com/nonprofits/),
[GitHub](https://socialimpact.github.com),
[Codemagic](https://codemagic.io/start/), [Linktree](https://linktr.ee),
[Twilio](https://twilio.org), [Algolia](https://www.algolia.com),
[JetBrains](https://www.jetbrains.com),
[Storyblok](https://www.storyblok.com),
[1Password](https://1password.com/), [Mux](https://www.mux.com/),
[Sentry](https://sentry.io) and [Lineto](https://www.lineto.com). Our
tools also leverage other open-source technologies, including solutions
like [FireCMS](https://firecms.co),
[Storybook](https://storybook.js.org) and
[Tailwind CSS](https://tailwindcss.com).

### Licensing Information

This project is licensed under [MIT](LICENSE), with the exception of the
[Unica77 font](https://lineto.com/typefaces/unica77), which is
exclusively licensed to Social Income.
