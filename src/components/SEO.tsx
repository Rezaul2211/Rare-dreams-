import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Rare Dreams | Premium Kids & Fashion Apparel',
  description = 'Shop exclusive, premium kids apparel, footwear, and fashion collections at Rare Dreams. Quality fabrics and stylish designs crafted for perfection.',
  image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
  url,
  type = 'website',
  keywords = 'Rare Dreams, kids apparel, boys wear, girls wear, baby essentials, footwear, Bangladesh fashion, premium clothing',
}) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteTitle = title.includes('Rare Dreams') ? title : `${title} | Rare Dreams`;

  useEffect(() => {
    // 1. Update Title
    document.title = siteTitle;

    // Helper function to create or update meta tags
    const updateMetaTag = (selector: string, attributeName: string, attributeValue: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMetaTag('meta[name="description"]', 'name', 'description', description);
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

    // Open Graph / Facebook Meta Tags
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', siteTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Rare Dreams');

    // Twitter Meta Tags
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', siteTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // Canonical URL Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [siteTitle, description, image, currentUrl, type, keywords]);

  return null;
};

export default SEO;
