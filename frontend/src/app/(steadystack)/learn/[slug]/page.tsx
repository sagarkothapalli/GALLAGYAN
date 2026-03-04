import { Metadata } from 'next';
import { ArticlePage } from '@/components/learn/ArticlePage';
import { MOCK_ARTICLES } from '@/data/mock-articles';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = MOCK_ARTICLES.find((a) => a.slug === params.slug);
  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
  };
}

export function generateStaticParams() {
  return MOCK_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default function ArticleRoute({ params }: Props) {
  const article = MOCK_ARTICLES.find((a) => a.slug === params.slug);
  return <ArticlePage article={article || null} />;
}
