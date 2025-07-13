const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  // Add more pages as needed
];

const stream = new SitemapStream({ hostname: 'https://si-admin-production.web.app' });

streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
  fs.writeFileSync('sitemap.xml', data.toString())
);