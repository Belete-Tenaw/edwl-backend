import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SITE_URL = 'https://ethiodomesticworkers.web.app';
export const BRAND_EN = 'Ethio Domestic Workers Link';
export const BRAND_AM = 'ኢትዮ የሃገር ውስጥ ሠራተኞች አገናኝ';
export const BRAND_AM_ALT = 'ኢትዮ የቤት ውስጥ ሠራተኞች አገናኝ';
export const SITE_NAME = `${BRAND_AM} - ${BRAND_EN}`;
export const DEFAULT_DESCRIPTION = `${BRAND_EN} (EDWL) helps Ethiopian households browse reviewed domestic worker profile summaries and sign up when ready. ${BRAND_AM}.`;
export const DEFAULT_IMAGE = `${SITE_URL}/edwl_logo.png`;

const normalizePath = (path = '/') => {
    if (!path || path === '/') return '/';
    return path.startsWith('/') ? path : `/${path}`;
};

export const buildCanonical = (path = '/') => `${SITE_URL}${normalizePath(path) === '/' ? '/' : normalizePath(path)}`;

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const Seo = ({
    title,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    image = DEFAULT_IMAGE,
    type = 'website',
    noIndex = false,
    structuredData = []
}) => {
    const canonical = buildCanonical(path);
    const pageTitle = title ? `${title} | ${BRAND_EN} | EDWL` : `${SITE_NAME} | EDWL`;
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
        <Helmet htmlAttributes={{ lang: 'en' }}>
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
            <link rel="canonical" href={canonical} />
            <link rel="alternate" hrefLang="en" href={canonical} />
            <link rel="alternate" hrefLang="am" href={canonical} />
            <link rel="alternate" hrefLang="x-default" href={canonical} />

            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="am_ET" />
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
