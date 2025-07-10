import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Akira Chronicles - Read Manga Online",
  description = "Read Akira Chronicles manga online with the best reading experience. Follow the epic story of Kaneda and Tetsuo in Neo-Tokyo.",
  image = "https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=1200",
  url = window.location.href,
  type = "website"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        if (selector.includes('property')) {
          element.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
        } else {
          element.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
        }
        element.content = content;
        document.head.appendChild(element);
      }
    };

    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', image);
    updateMetaTag('meta[property="og:url"]', url);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = url;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = url;
      document.head.appendChild(canonical);
    }
  }, [title, description, image, url, type]);

  return null;
};