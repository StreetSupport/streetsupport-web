const { SitemapStream } = require('sitemap');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const path = require('path');

/**
 * Simulates pulling dynamic routes from a CMS/database.
 * Replace this with actual DB calls, CMS API calls, etc.
 */
async function getDynamicRoutes() {
  return [
    { slug: 'service-one', updatedAt: '2025-04-20' },
    { slug: 'service-two', updatedAt: '2025-04-21' },
    { slug: 'blog-post-1', updatedAt: '2025-04-23' }
  ];
}

async function generateSitemap() {
  const publicDir = path.resolve(__dirname, '../streetsupport-web');
  const sitemapPath = path.resolve(publicDir, 'sitemap.xml');

  // Ensure the 'public' directory exists
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const writeStream = createWriteStream(sitemapPath);
  const sitemap = new SitemapStream({ hostname: 'https://streetsupport.net' });

  sitemap.pipe(writeStream);

  // Static pages
  sitemap.write({ url: '/', changefreq: 'weekly', priority: 1.0 });
  sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.8 });
  sitemap.write({ url: '/find-help', changefreq: 'monthly', priority: 0.8 });
  sitemap.write({ url: '/find-help/advice', changefreq: 'monthly', priority: 0.8 });
  sitemap.write({ url: '/locations', changefreq: 'monthly', priority: 0.8 });
  sitemap.write({ url: '/resources', changefreq: 'monthly', priority: 0.8 });
  sitemap.write({ url: '/about/privacy-and-data', changefreq: 'monthly', priority: 0.8 });
  sitemap.write({ url: '/about/contact', changefreq: 'monthly', priority: 0.8 });

  // Dynamic pages
  const dynamicRoutes = await getDynamicRoutes();

  dynamicRoutes.forEach((route) => {
    sitemap.write({
      url: `/pages/${route.slug}`,
      lastmod: route.updatedAt,
      changefreq: 'weekly',
      priority: 0.7,
    });
  });

  sitemap.end();

  // Wait until fully written
  writeStream.on('finish', () => {
    console.log('✅ Sitemap generated at /sitemap.xml');
  });

  writeStream.on('error', (err) => {
    console.error('❌ Error writing sitemap:', err);
    process.exit(1);
  });
}

generateSitemap().catch((err) => {
  console.error('❌ Error generating sitemap:', err);
  process.exit(1);
});
