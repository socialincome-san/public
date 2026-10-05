// Reads recipient and candidate counts per country from the "Initiate New Program"
// dialog on socialincome.org. Prints one block per active country:
// name, programs, recipients, "N candidates ready to enroll".
//
// Usage: node program-counts.mjs [url]
// Needs playwright (or playwright-core) resolvable from the current directory.
import { createRequire } from "node:module";

// Resolve from the current directory, not from this script's location.
const require = createRequire(`${process.cwd()}/`);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("playwright-core"));
}

const url = process.argv[2] ?? "https://socialincome.org/en/int";
const executablePath =
  process.env.CHROMIUM_PATH ??
  (process.env.PLAYWRIGHT_BROWSERS_PATH
    ? "/opt/pw-browsers/chromium"
    : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page
    .getByRole("button", { name: /initiate new program/i })
    .or(page.getByRole("link", { name: /initiate new program/i }))
    .first()
    .click({ timeout: 15000 });
  const dialog = page.getByRole("dialog");
  await dialog
    .getByText(/recipients/i)
    .first()
    .waitFor({ timeout: 30000 });
  // Only the active-country cards; the eligibility table for all of Africa follows them.
  const text = (await dialog.innerText()).split(/Review eligibility/i)[0];
  console.log(
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
  );
} finally {
  await browser.close();
}
