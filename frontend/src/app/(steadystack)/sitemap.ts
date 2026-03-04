import { MetadataRoute } from 'next';
import { MOCK_ARTICLES } from '@/data/mock-articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://steadystack.com';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/learn/calculators`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/learn/quiz`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  ];

  // Article pages — in production, fetched from Sanity
  const articlePages = MOCK_ARTICLES.map((article) => ({
    url: `${baseUrl}/learn/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
