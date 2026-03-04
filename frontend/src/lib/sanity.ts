import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImage } from '@/types';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImage) {
  return builder.image(source);
}

// GROQ queries
export const queries = {
  allArticles: `*[_type == "article"] | order(publishedAt desc) {
    _id, slug, title, excerpt, category, level, format,
    readTime, publishedAt, tags,
    "author": author->{name, title, avatar},
    featuredImage
  }`,

  articleBySlug: (slug: string) => `*[_type == "article" && slug.current == "${slug}"][0] {
    _id, slug, title, excerpt, body, category, level, format,
    readTime, publishedAt, updatedAt, seoTitle, seoDescription, tags,
    "author": author->{_id, name, title, bio, avatar},
    featuredImage,
    "relatedArticles": *[_type == "article" && slug.current != "${slug}" && category == ^.category][0...3] {
      _id, slug, title, excerpt, category, readTime, featuredImage
    }
  }`,

  featuredArticles: `*[_type == "article" && featured == true] | order(publishedAt desc)[0...6] {
    _id, slug, title, excerpt, category, level, readTime, featuredImage,
    "author": author->{name, avatar}
  }`,

  articlesByCategory: (category: string) =>
    `*[_type == "article" && category == "${category}"] | order(publishedAt desc) {
    _id, slug, title, excerpt, category, level, readTime, publishedAt, featuredImage,
    "author": author->{name, avatar}
  }`,

  calculators: `*[_type == "calculator"] | order(order asc) {
    _id, slug, title, description, icon, category
  }`,
};
