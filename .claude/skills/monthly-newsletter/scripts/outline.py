#!/usr/bin/env python3
"""Outline a newsletter HTML file, or find content left over from last month.

  outline.py <file.html>              visible text, headings, links, images with line numbers
  outline.py <new.html> --stale <prev.html>
                                      text and links in <new> that are identical to <prev>
                                      (boilerplate like footer/donate block is ignored)
"""
import re
import sys
from html.parser import HTMLParser

# Text that legitimately repeats every month.
BOILERPLATE = re.compile(
    r"^(Field Notes|Here's what has been happening.*|Country Office:|In the News:|Latest From Our Journal|"
    r"My World in Data|My World in News|A few highlights from my news addiction|Led by .*|Write her|"
    r"Would you consider making a small one-time donation\?|Of Course|❤️ Takes 45 seconds.*|"
    r"From Zurich with 💙|Aurélie Schmiedlin|Communications|Social Income|Zurich, Switzerland|"
    r"Preferences|/|Unsubscribe|•|\(|\)|\.|,|Sierra Leone|Liberia|Ghana|by .*|Hi \{\{.*)$"
)
BOILERPLATE_LINKS = re.compile(
    r"^(https://socialincome\.org/?(about-us#team|countries/\w[\w-]*|programs\?country=\w+|donate/one-time|"
    r"en/int/journal|journal)?|mailto:.*|https://www\.linkedin\.com/in/.*|\{\{\{.*\}\}\})$"
)


class Outline(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.items = []  # (line, kind, value)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]
        if tag in ("style", "head"):
            self.skip += 1
        elif tag == "a":
            self.items.append((line, "link", a.get("href", "")))
        elif tag == "img":
            self.items.append((line, "img", f"{a.get('alt')} {a.get('src', '')}"))
        elif tag in ("h1", "h2", "h3"):
            self.items.append((line, tag, ""))

    def handle_endtag(self, tag):
        if tag in ("style", "head"):
            self.skip -= 1

    def handle_data(self, data):
        text = " ".join(data.replace("‌", "").replace("\xa0", " ").split())
        if text and not self.skip:
            self.items.append((self.getpos()[0], "text", text))


def parse(path):
    p = Outline()
    p.feed(open(path, encoding="utf-8").read())
    return p.items


def main():
    if len(sys.argv) == 2:
        for line, kind, value in parse(sys.argv[1]):
            prefix = "" if kind == "text" else f"[{kind}] "
            print(f"{line}: {prefix}{value[:140]}")
        return
    if len(sys.argv) == 4 and sys.argv[2] == "--stale":
        new, prev = parse(sys.argv[1]), parse(sys.argv[3])
        prev_text = {v for _, k, v in prev if k == "text"}
        prev_links = {v for _, k, v in prev if k == "link"}
        found = 0
        for line, kind, value in new:
            if kind == "text" and value in prev_text and len(value) > 3 and not BOILERPLATE.match(value):
                print(f"{line}: same text as last month: {value[:140]}")
                found += 1
            elif kind == "link" and value in prev_links and not BOILERPLATE_LINKS.match(value):
                print(f"{line}: same link as last month: {value}")
                found += 1
        print(f"\n{found} possible leftovers from {sys.argv[3]}")
        return
    print(__doc__)
    sys.exit(1)


if __name__ == "__main__":
    main()
