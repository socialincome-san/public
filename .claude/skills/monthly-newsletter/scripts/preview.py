#!/usr/bin/env python3
"""Make a preview copy of a newsletter with every image embedded in the file.

  preview.py <newsletter.html> <out.html>

The chat preview (canvas) doesn't load images from other websites, so the
SendGrid images are missing there. This copy has them built in as data: URIs.
It's for viewing only: never commit it or send it, it's far too big for email.
"""
import base64
import re
import sys
import urllib.request

src_path, out_path = sys.argv[1], sys.argv[2]
html = open(src_path, encoding='utf-8').read()
cache = {}


def embed(match):
    url = match.group(1)
    if url not in cache:
        with urllib.request.urlopen(url) as response:
            mime = response.headers.get_content_type()
            cache[url] = f'data:{mime};base64,{base64.b64encode(response.read()).decode()}'
    return f'src="{cache[url]}"'


preview = re.sub(r'src="(https?://[^"]+)"', embed, html)
open(out_path, 'w', encoding='utf-8').write(preview)
print(f'{len(cache)} images embedded, {len(preview) // 1024} KB -> {out_path}')
