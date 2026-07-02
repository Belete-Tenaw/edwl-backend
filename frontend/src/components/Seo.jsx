import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://edwl.io';
export const BRAND_EN = 'Trustworthy Domestic Workers';
export const BRAND_AM = 'ታማኝ የሃገር ውስጥ ሠራተኞች';
export const BRAND_AM_ALT = 'ታማኝ የሃገር ውስጥ ሠራተኞች';
export const SITE_NAME = `${BRAND_AM} - ${BRAND_EN}`;
export const DEFAULT_DESCRIPTION = `${BRAND_EN} (TDW) helps Ethiopian households browse reviewed domestic worker profile summaries and sign up when ready. ${BRAND_AM}.`;
export const DEFAULT_IMAGE = `${SITE_URL}/edwl_logo.png`;

const normalizePath = (path = '/') => {
    if (!path || path === '/') return '/';
    return path.startsWith('/') ? path : `/${path}`;
};

export const buildCanonical = (path = '/', lang = 'en') => {
    const normalizedPath = normalizePath(path);
    const baseUrl = `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
    if (lang === 'am') {
        return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}lang=am`;
    }
    return baseUrl;
};

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const Seo = ({
    title,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    image = DEFAULT_IMAGE,
    type = 'website',
    noIndex = false,
    structuredData = [],
    language
}) => {
    const { i18n } = useTranslation();
    const currentLanguage = language || i18n.language || 'en';
    const isAmharic = currentLanguage === 'am';
    const canonical = buildCanonical(path, 'en');
    const amCanonical = buildCanonical(path, 'am');
    const pageTitle = title ? `${title} | ${BRAND_EN} | TDW` : `${SITE_NAME} | TDW`;
    const dataItems = Array.isArray(structuredData) ? structuredData : [structuredData];
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: pageTitle,
            description,
            inLanguage: ['en', 'am'],
            isPartOf: { '@id': `${SITE_URL}/#website` },
            about: { '@id': `${SITE_URL}/#organization` }
        },
        ...dataItems.filter(Boolean)
    ];

    return (
        <Helmet htmlAttributes={{ lang: currentLanguage }}>
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
            <link rel="canonical" href={canonical} />
            <link rel="alternate" hrefLang="en" href={canonical} />
            <link rel="alternate" hrefLang="am" href={amCanonical} />
            <link rel="alternate" hrefLang="x-default" href={canonical} />
            <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content={isAmharic ? 'am_ET' : 'en_US'} />
            <meta property="og:locale:alternate" content={isAmharic ? 'en_US' : 'am_ET'} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <script type="application/ld+json">{safeJson(jsonLd)}</script>
        </Helmet>
    );
};

export default Seo;
