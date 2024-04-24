import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const robots = (): MetadataRoute.Robots => {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/admin', '/dashboard/shop/cart'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
};

export default robots;
