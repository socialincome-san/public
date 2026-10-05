---
name: monthly-newsletter
description: Builds Social Income's monthly newsletter HTML (website/emails/newsletter/YYYY-MM-newsletter.html) from the latest entry in the "Proofreading" tab of the Monthly Updates Google Doc. Use this whenever someone wants to create, build, port, update or fill in the newsletter / monthly update / "Update" email for a month, move the proofread text into HTML, or works on a branch like `aurelie/YYYY-MM-newsletter` — even if they just say "do the November one" or "the text is ready".
---

# Monthly newsletter

Each month Aurélie writes the newsletter in a Google Doc. After editing and
proofreading, the text goes into a hand-built HTML email that is sent via
SendGrid and archived in this repo. This skill does that port: doc → HTML.

The HTML is ~2,200 lines of table-based email markup. Never write it from
scratch. Copy last month's file and swap the content, block by block, so all
the email-client hacks (MSO conditionals, inline styles, dark-mode classes)
survive.

## 1. Work out the target month

- Branch name `aurelie/YYYY-MM-newsletter` gives the month. Otherwise use next
  month (the issue goes out on the 1st, so it's built at the end of the month before).
- Target file: `website/emails/newsletter/YYYY-MM-newsletter.html`.
- Template: the newest existing issue before it (months are sometimes skipped,
  e.g. there is no 2026-07).
- If the target file exists, compare it with the template. If it only differs by
  a line or two, it's an unfinished copy: overwrite the content. If it differs a
  lot, someone already worked on it: ask before overwriting.

## 2. Get the text from the Google Doc

Doc: `1t5D1SmdTABNyIROxDOKHJUq7m9IyXrr9pUn1edd6HL0` ("Monthly Updates").
Read it with the Google Drive connector (`read_file_content`). The doc is huge,
so the result usually gets saved to a file. Extract it with
`jq -r .fileContent <file> > doc.txt`, then work with grep and sed.

The doc has tabs that show up in the text as top-level headings: Process,
Ideas, **Proofreading**, Archive. Use only the Proofreading tab, between
`# 🟢 Proofreading` and `# 🟡 Archive` (emoji may come through mangled, so match
on the words). The entry starts with `## **<Mon> 1, YYYY** **Update**`.

Check that the entry is for the target month. The year in the heading is
often wrong (Sep 2026 was labeled "Sep 1, 2025"), so trust the month and the
content (dates mentioned, "this month" references). If the latest entry is for
an earlier month, stop and tell the user: the draft isn't in the Proofreading
tab yet.

Also report the proofreading status from the table at the end of the entry
(e.g. "Proofread by Matt: voting chip with one vote" means done, "no votes"
means not proofread yet). Building from an unproofread draft is fine, but say so.

## 3. Get the numbers

**Recipients and candidates per country** (the country cards in Field Notes):
these come from the "Initiate New Program" dialog on socialincome.org. Run:

```bash
cd <scratchpad> && npm i --silent playwright-core   # once, if playwright isn't resolvable
node <skill-dir>/scripts/program-counts.mjs
```

It prints programs, recipients and "N candidates ready to enroll" per country.

In cloud sessions, two things can get in the way:

- `ERR_TUNNEL_CONNECTION_FAILED`: the environment's network policy blocks
  socialincome.org. The user has to allow the host in the environment settings.
- `ERR_CERT_AUTHORITY_INVALID`: Chromium's certificate store (`~/.pki/nssdb`)
  is empty. Load the public roots from the proxy's CA bundle. Never turn off
  certificate checks.
  ```bash
  command -v certutil || apt-get install -y -qq libnss3-tools
  mkdir -p ca && awk '/BEGIN CERT/{n++} {print > "ca/c-" n ".pem"}' /root/.ccr/ca-bundle.crt
  for f in ca/c-*.pem; do certutil -A -d sql:$HOME/.pki/nssdb -n "$(basename $f)" -t "C,," -i "$f"; done
  ```

If it still fails (button renamed, site down), ask the user to
open socialincome.org → "Initiate new program" and paste the numbers. Don't
reuse last month's numbers silently: in October, Sierra Leone's candidate count
was left unchanged from September by accident.

**"this email took me Xh Ymin to write"** (donate block): keep last month's value.

## 4. Map the doc to the HTML

Get the template's structure first:

```bash
python3 <skill-dir>/scripts/outline.py website/emails/newsletter/<template>.html
```

It prints every visible text, heading, link and image with its line number.
Then replace content section by section:

| Doc                                | HTML                                                                                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Subject:`                         | `<h1 class="feature">`, with a period at the end ("Shoes, Stablecoins and Schools.")                                                                                                                                            |
| first 1–2 sentences of the body    | hidden preheader `<div>` right after `<body>` (keep the trailing `&zwnj;&nbsp;` padding). This is the inbox preview, so it has to be updated every month. September shipped with August's.                                      |
| `Hey *\|FNAME\|*!`                 | leave `Hi {{ insert first_name 'default=there' }},` unchanged (SendGrid syntax, not Mailchimp)                                                                                                                                  |
| intro paragraphs                   | the `<p>` blocks under the greeting                                                                                                                                                                                             |
| date                               | `• Oct 2026` under the author name → target month                                                                                                                                                                               |
| Country office news → each country | the country card ("Sierra Leone card" comments): `Country Office:` text, then `In the News:` items. Separate items with `•`. Each news item is the headline plus its source label linking to the article with the ↗ icon image. |
| recipients / candidates            | `573 Recipients` and `753 candidates ready for a program` in each card                                                                                                                                                          |
| `New journal articles`             | "Latest From Our Journal": one row per article, with `by <author>` + ↗                                                                                                                                                          |
| each bold-titled story             | an `<h2 class="feature">` story section (color `#01579b`), separated by the `border-bottom: 1px solid #d4dadf` divider rows                                                                                                     |
| `My World in Data`                 | big number + paragraph + punchline, one block per figure                                                                                                                                                                        |
| `My World in News`                 | one row per item: title + source label + ↗                                                                                                                                                                                      |
| sign-off / donate / footer         | leave as is, unless the draft says otherwise                                                                                                                                                                                    |

House style in the HTML that the doc doesn't show:

- **Punchlines in blue.** Short closing lines and bold emphasis in the doc
  ("The people know. The system doesn't.", "Wow!") are wrapped in
  `<span style="color: #01579b">…</span>`. Look at how the template does it
  and do the same for the new punchlines.
- **Links** keep the template's exact attributes:
  `clicktracking="off" target="_blank" rel="noopener noreferrer"` plus the
  inline style. Copy an existing `<a>` and change only the href and text.
- **Typography:** use curly apostrophes and quotes (’ “ ”), as the doc does.
  Use `&amp;` in text. Don't add em dashes that aren't in the doc.
- Doc text wins over the HTML's wording. Don't rewrite or "improve" the copy.
  It has been edited and proofread. If something looks like a typo, flag it in
  the report instead of fixing it silently.

**When the draft doesn't match the template's layout** (more or fewer stories,
countries, data figures, news items, or a new kind of section such as
"Before you go"): follow the draft. Duplicate or delete the matching block,
including its divider row. For a section type the template doesn't have,
look in `website/emails/newsletter/Single Components/` (africa-trivia,
fundraiser-banner, team-news, cards-wip) and older issues
(`grep -l "<text>" website/emails/newsletter/*.html`) for a block to reuse.
Only build a new block from the template's existing styles as a last resort,
and mention it in the report.

**Placeholders** in the draft (`example.com` links, `[PHOTO: …]` notes, `TBD`):
build anyway, keep the placeholder visible in the HTML (link to the
placeholder URL, put the `[PHOTO: …]` text where the photo goes), and list
every one in the report. Don't invent URLs or pick photos.

## 5. Check

1. Leftovers from last month:
   ```bash
   python3 <skill-dir>/scripts/outline.py <new>.html --stale <template>.html
   ```
   Every hit is either correct (same source name like "YouTube", a recurring
   label) or a forgotten replacement. Go through all of them.
2. Placeholders: `grep -nE "example\.com|\[PHOTO|TBD|TODO" <new>.html`.
3. Markup: compare the tag counts of `<table`, `<tr`, `<td` against their
   closing tags in the new file. They must balance like in the template.
4. Look at it. Screenshot the file at 600px and 375px width with Playwright
   (Chromium is at `/opt/pw-browsers/chromium` in cloud sessions) and view the
   images. Check for broken blocks, missing dividers and leftover template content.

## 6. Report

End with a short report the user can act on:

- Which doc entry was used, and its proofreading status
- Numbers used (and where from), or which ones are still missing
- Every placeholder still in the file, with line numbers
- Anything in the draft that didn't fit and how you handled it
- Possible typos in the doc text (quote them; don't fix them)

Don't minify, send, or upload anything. Minifying and sending happen in
SendGrid, outside this repo. Commit the HTML to the newsletter branch only
when the user asks.
