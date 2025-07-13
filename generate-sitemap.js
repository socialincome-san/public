const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  // Add more pages here
];

const stream = new SitemapStream({ hostname: 'https://si-admin-production.web.app' });
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');

(async () => {
  try {
    // Ensure the public folder exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate and format sitemap
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    const formattedXml = xml.toString().replace(/></g, '>\n<'); // Add line breaks for readability

    fs.writeFileSync(outputPath, formattedXml);
    console.log(`✅ Sitemap generated at ${outputPath}`);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(1);
  }
})();
