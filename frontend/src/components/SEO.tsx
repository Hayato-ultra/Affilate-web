import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
}

const SITE_NAME = 'Lumina Commerce';
const DEFAULT_DESC = 'Compare prices across Amazon, Flipkart, eBay, Meesho & Croma. Find the best deals with our affiliate aggregator engine.';

export default function SEO({ title, description, canonical, image, type = 'website' }: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Affiliate Aggregator Engine`;
  const desc = description || DEFAULT_DESC;
  const img = image || 'https://luminacommerce.com/og-image.jpg';
  const url = canonical || 'https://luminacommerce.com';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}
