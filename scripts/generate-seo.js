#!/usr/bin/env node

/**
 * ========================================
 * SEO Generation Script for EDWL
 * ========================================
 * Generates:
 * - robots.txt
 * - sitemap.xml
 * - SEO metadata files
 * - Schema.org JSON-LD
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://edwl.io';
const OUTPUT_DIR = path.join(__dirname, '../public');

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  const content = `# EDWL robots.txt
# Allow all search engines to crawl public pages

User-agent: *
Allow: /
Allow: /jobs/
Allow: /seekers/
Allow: /employers/
Allow: /about/
Allow: /contact/

Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /dashboard/
Disallow: /*.json$
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /auth/
Disallow: /settings/

# Crawl delay for non-premium crawlers
Request-rate: 1/10

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-jobs.xml
Sitemap: ${SITE_URL}/sitemap-seekers.xml
Sitemap: ${SITE_URL}/sitemap-employers.xml

# Allow Google and Bing search index
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Block bad bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), content);
  console.log('✅ robots.txt generated');
}

/**
 * Generate Sitemap Index
 */
function generateSitemapIndex() {
  const now = new Date().toISOString().split('T')[0];
  
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-jobs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-seekers.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-employers.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), content);
  console.log('✅ sitemap.xml (index) generated');
}

/**
 * Generate Static Pages Sitemap
 */
function generateStaticSitemap() {
  const now = new Date().toISOString().split('T')[0];
  
  const pages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/jobs', priority: '0.9', changefreq: 'hourly' },
    { url: '/seekers', priority: '0.9', changefreq: 'hourly' },
    { url: '/employers', priority: '0.9', changefreq: 'hourly' },
    { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  ];

  let content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  for (const page of pages) {
    content += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${page.url}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="am" href="${SITE_URL}${page.url}?lang=am"/>
  </url>
`;
  }

  content += `</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-static.xml'), content);
  console.log('✅ sitemap-static.xml generated');
}

/**
 * Generate JSON-LD Schema
 */
function generateSchemaOrg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'EDWL - Ethio Domestic Workers Link',
    'url': SITE_URL,
    'description': 'Connect trusted domestic workers with employers in Ethiopia',
    'image': `${SITE_URL}/logo.png`,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'ETB',
      'price': '0',
      'description': 'Free to browse and connect'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '500',
      'bestRating': '5',
      'worstRating': '1'
    },
    'author': {
      '@type': 'Organization',
      'name': 'EDWL',
      'url': SITE_URL,
      'logo': `${SITE_URL}/logo.png`
    },
    'inLanguage': ['en', 'am']
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Ethio Domestic Workers Link',
    'url': SITE_URL,
    'logo': `${SITE_URL}/logo.png`,
    'sameAs': [
      'https://www.facebook.com/edwl',
      'https://twitter.com/edwl',
      'https://www.instagram.com/edwl'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+251-1-234-5678',
      'contactType': 'Customer Service',
      'email': 'support@edwl.io'
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'schema-app.json'),
    JSON.stringify(schema, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'schema-org.json'),
    JSON.stringify(orgSchema, null, 2)
  );

  console.log('✅ schema-app.json and schema-org.json generated');
}

/**
 * Generate Metadata Configuration
 */
function generateMetadataConfig() {
  const config = {
    title: {
      en: 'EDWL - Ethio Domestic Workers Link',
      am: 'ኢ.ዶ.ወ.ደ - ኢትዮጵያ የቤት ሰራተኞች ማገናኛ'
    },
    description: {
      en: 'Connect with trusted domestic workers and employers in Ethiopia. Safe, secure, and verified matching platform.',
      am: 'ኢትዮጵያ ውስጥ ታማኝ የቤት ሰራተኞችን እና አጼዋሪዎችን ያገናኙ። ደህንነተኛ፣ ተጠብቅ፣ እና የተረጋገጠ ማዛመድ ፕላትፎርም።'
    },
    keywords: {
      en: 'domestic workers, Ethiopia, job matching, employment, household staff, nannies, housekeepers',
      am: 'የቤት ሰራተኞች, ኢትዮጵያ, ሥራ ማዛመድ, ቅጥ, የቤት ሰራተኛ, ለአሁቤ, ገዥ'
    },
    ogImage: `${SITE_URL}/og-image.png`,
    twitterImage: `${SITE_URL}/twitter-image.png`,
    twitterHandle: '@edwl_io',
    socialMediaLinks: {
      facebook: 'https://www.facebook.com/edwl',
      twitter: 'https://twitter.com/edwl',
      instagram: 'https://www.instagram.com/edwl',
      linkedin: 'https://www.linkedin.com/company/edwl'
    },
    contact: {
      email: 'support@edwl.io',
      phone: '+251-1-234-5678',
      address: 'Addis Ababa, Ethiopia'
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'metadata.json'),
    JSON.stringify(config, null, 2)
  );

  console.log('✅ metadata.json generated');
}

/**
 * Generate .well-known files
 */
function generateWellKnownFiles() {
  // Create .well-known directory
  const wellKnownDir = path.join(OUTPUT_DIR, '.well-known');
  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }

  // security.txt
  const securityTxt = `Contact: security@edwl.io
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en, am
`;

  fs.writeFileSync(path.join(wellKnownDir, 'security.txt'), securityTxt);
  console.log('✅ .well-known/security.txt generated');
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting SEO generation...\n');

  try {
    generateRobotsTxt();
    generateSitemapIndex();
    generateStaticSitemap();
    generateSchemaOrg();
    generateMetadataConfig();
    generateWellKnownFiles();

    console.log('\n✅ All SEO files generated successfully!');
    console.log('\nGenerated files:');
    console.log('  - robots.txt');
    console.log('  - sitemap.xml (index)');
    console.log('  - sitemap-static.xml');
    console.log('  - schema-app.json');
    console.log('  - schema-org.json');
    console.log('  - metadata.json');
    console.log('  - .well-known/security.txt');
  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateRobotsTxt,
  generateSitemapIndex,
  generateStaticSitemap,
  generateSchemaOrg,
  generateMetadataConfig,
  generateWellKnownFiles,
};
