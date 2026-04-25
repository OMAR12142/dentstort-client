import { Helmet } from 'react-helmet-async';

/**
 * SEO Component: Centralized Metadata Management
 * 
 * @param {string} title - Page title (appended with DentStory)
 * @param {string} description - Meta description
 * @param {string} canonical - Canonical URL (absolute)
 * @param {string} ogImage - Social sharing image URL
 * @param {boolean} noindex - Whether to block search engines (for private pages)
 * @param {object} jsonLd - Structured data object to inject
 */
const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage = '/og-image.png', // Default premium fallback
  noindex = false,
  jsonLd = null 
}) => {
  const siteName = 'DentStory';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Privacy Guard (noindex for dashboards/admin) */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
