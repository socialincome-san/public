# Get involved prototype

Interactive design prototype for the Social Income Get involved pages.

Run from the repository root:

```sh
python3 -m http.server 3005 --bind 127.0.0.1 --directory work
```

Open <http://localhost:3005/get-involved-illustrated-roles.html>.

The overview groups actions for individuals, companies and NGOs. All ten
actions open simulated child pages with their own title and breadcrumb.
Example: `#get-involved/individual/donate`.

The donation calculator supports 1% of monthly income or a custom amount.
Income mode defaults to monthly giving; custom amounts default to a
one-time gift. The adjacent text action switches the interval while
keeping the amount. Both CTA labels update with the slider.

This is a standalone prototype, not a production Next.js implementation.
The homepage is a reference screenshot with navigation hotspots. Other
placeholder links and the donation CTA do not submit a payment.
Only the current proposal and its required assets are included.
