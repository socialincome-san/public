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

## 3. Numbers

Leave every number in the country cards (`573 Recipients`, `753 candidates
ready for a program`) and "this email took me Xh Ymin to write" exactly as
they are in the template. The user updates them by hand.

## 4. Map the doc to the HTML

Get the template's structure first:

```bash
python3 <skill-dir>/scripts/outline.py website/emails/newsletter/<template>.html
```

It prints every visible text, heading, link and image with its line number.
Then replace content section by section:

| Doc | HTML |
|---|---|
| `Subject:` | `<h1 class="feature">`, with a period at the end ("Shoes, Stablecoins and Schools.") |
| first 1–2 sentences of the body | hidden preheader `<div>` right after `<body>` (keep the trailing `&zwnj;&nbsp;` padding). This is the inbox preview, so it has to be updated every month. September shipped with August's. |
| `Hey *\|FNAME\|*!` | leave `Hi {{ insert first_name 'default=there' }},` unchanged (SendGrid syntax, not Mailchimp) |
| intro paragraphs | the `<p>` blocks under the greeting |
| date | `• Oct 2026` under the author name → target month |
| Country office news → each country | the country card ("Sierra Leone card" comments): `Country Office:` text, then `In the News:` items. Separate items with `•`. Each news item is the headline plus its source label linking to the article with the ↗ icon image. |
| `New journal articles` | "Latest From Our Journal": one row per article, with `by <author>` + ↗ |
| each bold-titled story | an `<h2 class="feature">` story section (color `#01579b`), separated by the `border-bottom: 1px solid #d4dadf` divider rows |
| `My World in Data` | big number + paragraph + punchline, one block per figure |
| `My World in News` | one row per item: title + source label + ↗ |
| sign-off / donate / footer | leave as is, unless the draft says otherwise |

House style in the HTML that the doc doesn't show:

- **Highlights in blue.** Each paragraph usually has one phrase in
  `<span style="color: #01579b">…</span>`. The doc doesn't mark them, so pick
  them yourself: the part a skimming reader should catch. That's the
  surprising fact, the key number, the turn in the story or the punchline.
  Bold text and short closing lines in the doc ("The people know. The system
  doesn't.", "Wow!") are always blue. Highlight a phrase, not a whole
  paragraph, and at most one or two per paragraph. Look at the template for
  how much is usual. Not in Field Notes: the country cards have their own
  formatting (blue labels, underlined links) and get no extra highlights.
- **Links sit inside the sentence**, on the words they belong to ("a new
  `<a>Guardian investigation</a>` tells…"), as the doc has them. Don't end
  stories, data figures or news items with a separate "Read more" link line
  unless the doc really has one there.
- **Links** keep the template's exact attributes:
  `clicktracking="off" target="_blank" rel="noopener noreferrer"` plus the
  inline style. Copy an existing `<a>` and change only the href and text.
- **Titles in Title Case**, always: the `<h1>`, every `<h2>` section title
  and journal article titles ("Mango Season", "Before You Go", "Money Without
  Banks"), even when the doc writes them in sentence case. Small words stay
  lowercase unless they come first (a, an, the, and, or, of, in, on, to,
  for). News items in "My World in News" keep the doc's casing.
- **Typography:** use curly apostrophes and quotes (’ “ ”), as the doc does.
  Use `&amp;` in text. Don't add em dashes that aren't in the doc.
- **One style across the whole email.** The doc mixes styles. Make them
  match:
  - US spelling everywhere ("program", "organized", "traveled",
    "organization"), because the site and the cards use US spelling.
  - Curly apostrophes and quotes everywhere, including leftover template
    text ("Here’s what has been happening").
  - Source labels named the same way ("The Guardian" next to "The
    Economist", not "Guardian").
  - Rows of the same kind look the same: no bold on one journal row when the
    others have none, the same `•` separators in every country card.
  - Blue highlights spread evenly: every story and data figure gets one, not
    just some of them.

  List these changes in the report. They're the only edits allowed to the
  doc's wording.
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

**Placeholders** in the draft (`example.com` links, `TBD`): build anyway, keep
the placeholder visible in the HTML (link to the placeholder URL), and list
every one in the report. Don't invent URLs.

**Photo notes** (`[PHOTO: …]`) never go into the HTML, not even as text. The
country cards have no photo slot. Leave them out and list them in the report
so the user can add a link to the photo if they want one.

## 5. Check

1. Leftovers from last month:
   ```bash
   python3 <skill-dir>/scripts/outline.py <new>.html --stale <template>.html
   ```
   Every hit is either correct (same source name like "YouTube", a recurring
   label) or a forgotten replacement. Go through all of them.
2. Placeholders: `grep -nE "example\.com|\[PHOTO|TBD|TODO" <new>.html`. A `[PHOTO` hit is a mistake: remove it.
3. Markup: compare the tag counts of `<table`, `<tr`, `<td` against their
   closing tags in the new file. They must balance like in the template.
4. Consistency: read the whole email top to bottom once more. Check that
   every title is in Title Case, the spelling is US throughout, the
   apostrophes are curly and each story and data figure has its blue
   highlight.
5. Look at it. Screenshot the file at 600px and 375px width with Playwright
   (Chromium is at `/opt/pw-browsers/chromium` in cloud sessions) and view the
   images. Check for broken blocks, missing dividers and leftover template content.
6. Show it in the chat. The chat preview doesn't load images from other
   websites, so the SendGrid images go missing there. Make a copy with the
   images built in and send that one to the user:
   ```bash
   python3 <skill-dir>/scripts/preview.py <new>.html <scratchpad>/YYYY-MM-newsletter-preview.html
   ```
   Keep the copy in the scratchpad. It's for viewing only: never commit it.

## 6. Report

End with a short report the user can act on:

- Which doc entry was used, and its proofreading status
- A reminder to update the recipient and candidate numbers by hand
- Every placeholder still in the file, with line numbers
- Anything in the draft that didn't fit and how you handled it
- Possible typos in the doc text (quote them; don't fix them)

Don't minify, send, or upload anything. Minifying and sending happen in
SendGrid, outside this repo. Commit the HTML to the newsletter branch only
when the user asks.
