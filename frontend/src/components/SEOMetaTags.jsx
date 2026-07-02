/**
 * ========================================
 * SEO Meta Tags Component (React)
 * ========================================
 * Manages all SEO meta tags for Amharic/English
 * and Open Graph integration
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

/**
 * Meta Tag Configuration
 */
const SEO_CONFIG = {
  en: {
    home: {
      title: 'TDW - Trustworthy Domestic Workers | Job Matching Platform',
      description: 'Connect with trustworthy domestic workers and employers in Ethiopia. Safe, secure, and verified matching platform.',
      keywords: 'domestic workers, Ethiopia, job matching, employment, household staff, nannies, housekeepers, trustworthy workers',
      canonical: 'https://edwl.io',
    },
    jobs: {
      title: 'Job Listings - TDW | Find Domestic Work in Ethiopia',
      description: 'Browse available domestic worker jobs in Ethiopia. Connect with verified employers.',
      keywords: 'job listings, domestic jobs, Ethiopia jobs, household work, trustworthy workers',
      canonical: 'https://edwl.io/jobs',
    },
    seekers: {
      title: 'Job Seekers - TDW | Find Work as a Domestic Worker',
      description: 'Browse verified job seekers looking for domestic work in Ethiopia.',
      keywords: 'job seekers, workers, domestic staff, Ethiopia',
      canonical: 'https://edwl.io/seekers',
    },
    employers: {
      title: 'Employers - TDW | Hire Trusted Domestic Workers',
      description: 'Post jobs and find verified domestic workers in Ethiopia.',
      keywords: 'hire workers, employer, job posting, Ethiopia',
      canonical: 'https://edwl.io/employers',
    },
  },
  am: {
    home: {
      title: 'ታማኝ የሃገር ውስጥ ሠራተኞች - ታማኝ የቤት ሰራተኞች | ሥራ ማዛመድ ፕላትፎርም',
      description: 'ኢትዮጵያ ውስጥ ታማኝ የቤት ሰራተኞችን እና አጼዋሪዎችን ያገናኙ። ደህንነተኛ፣ ተጠብቅ፣ እና የተረጋገጠ ማዛመድ ፕላትፎርም።',
      keywords: 'የቤት ሰራተኞች, ኢትዮጵያ, ሥራ ማዛመድ, ቅጥ, የቤት ሰራተኛ, ታማኝ ሰራተኞች',
      canonical: 'https://edwl.io?lang=am',
    },
    jobs: {
      title: 'ሥራ ዝርዝር - TDW | በኢትዮጵያ የቤት ሰራ ያግኙ',
      description: 'በኢትዮጵያ ውስጥ የሚገኙ የቤት ሰራተኛ ሥራዎች ይዩ። ታማኝ አጼዋሪዎች ጋር ያገናኙ።',
      keywords: 'ሥራ ዝርዝር, የቤት ሥራ, ኢትዮጵያ ሥራ, ታማኝ ሰራተኞች',
      canonical: 'https://edwl.io/jobs?lang=am',
    },
  }
};

/**
 * SEO Meta Tags Component
 */
export function SEOMetaTags({ page = 'home', customMeta = {} }) {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  const config = SEO_CONFIG[language]?.[page] || SEO_CONFIG.en[page];

  if (!config) {
    console.warn(`No SEO config found for page: ${page}, language: ${language}`);
    return null;
  }

  const finalMeta = { ...config, ...customMeta };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <title>{finalMeta.title}</title>
      <meta name="description" content={finalMeta.description} />
      <meta name="keywords" content={finalMeta.keywords} />
      <meta name="author" content="TDW Team" />
      <meta name="copyright" content="© 2026 TDW. All rights reserved." />

      {/* Canonical URL */}
      <link rel="canonical" href={finalMeta.canonical} />
      <link rel="alternate" hrefLang="en" href={finalMeta.canonical.replace('?lang=am', '')} />
      <link rel="alternate" hrefLang="am" href={finalMeta.canonical + (finalMeta.canonical.includes('?') ? '&lang=am' : '?lang=am')} />
      <link rel="alternate" hrefLang="x-default" href={finalMeta.canonical.replace('?lang=am', '')} />

      {/* Open Graph (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalMeta.canonical} />
      <meta property="og:title" content={finalMeta.title} />
      <meta property="og:description" content={finalMeta.description} />
      <meta property="og:image" content="https://edwl.io/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={language === 'am' ? 'am_ET' : 'en_US'} />
      <meta property="og:site_name" content="TDW - Trustworthy Domestic Workers" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@edwl_io" />
      <meta name="twitter:title" content={finalMeta.title} />
      <meta name="twitter:description" content={finalMeta.description} />
      <meta name="twitter:image" content="https://edwl.io/twitter-image.png" />
      <meta name="twitter:creator" content="@edwl_io" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="nositelinkssearchbox" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content="#FF4500" />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="TDW" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData(language, page))}
      </script>

      {/* Preload fonts */}
      <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />

      {/* Sitemap */}
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    </Helmet>
  );
}

/**
 * Generate Structured Data (JSON-LD)
 */
function getStructuredData(language, page) {
  const baseUrl = 'https://edwl.io';

  const commonData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': language === 'am' ? 'ኢ.ዶ.ወ.ደ' : 'EDWL',
    'url': baseUrl,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'inLanguage': language === 'am' ? 'am' : 'en',
    'author': {
      '@type': 'Organization',
      'name': 'EDWL',
      'url': baseUrl,
      'logo': `${baseUrl}/logo.png`,
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '500',
      'bestRating': '5',
      'worstRating': '1',
    },
  };

  if (page === 'jobs') {
    return {
      ...commonData,
      '@type': 'CollectionPage',
      'name': language === 'am' ? 'ሥራ ዝርዝር' : 'Job Listings',
    };
  }

  if (page === 'seekers') {
    return {
      ...commonData,
      '@type': 'ProfilePage',
      'name': language === 'am' ? 'ሥራ ፈላጊዎች' : 'Job Seekers',
    };
  }

  if (page === 'employers') {
    return {
      ...commonData,
      '@type': 'ProfilePage',
      'name': language === 'am' ? 'አጼዋሪዎች' : 'Employers',
    };
  }

  return commonData;
}

/**
 * Page-Specific SEO Components
 */

export function HomePageSEO() {
  return <SEOMetaTags page="home" />;
}

export function JobsPageSEO() {
  return <SEOMetaTags page="jobs" />;
}

export function SeekersPageSEO() {
  return <SEOMetaTags page="seekers" />;
}

export function EmployersPageSEO() {
  return <SEOMetaTags page="employers" />;
}

/**
 * Dynamic Page SEO
 */
export function DynamicPageSEO({ title, description, keywords, url, image }) {
  return (
    <SEOMetaTags
      page="home"
      customMeta={{
        title,
        description,
        keywords,
        canonical: url,
      }}
    />
  );
}

/**
 * Breadcrumb Schema
 */
export function BreadcrumbSchema({ items = [] }) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbList)}
      </script>
    </Helmet>
  );
}

/**
 * Organization Schema
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'EDWL - Ethio Domestic Workers Link',
    'url': 'https://edwl.io',
    'logo': 'https://edwl.io/logo.png',
    'description': 'Connect trusted domestic workers with employers in Ethiopia',
    'sameAs': [
      'https://www.facebook.com/edwl',
      'https://twitter.com/edwl_io',
      'https://www.instagram.com/edwl_io',
      'https://www.linkedin.com/company/edwl',
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'telephone': '+251-1-234-5678',
      'email': 'support@edwl.io',
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Addis Ababa',
      'addressCountry': 'ET',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export default SEOMetaTags;
