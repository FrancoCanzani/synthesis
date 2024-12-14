import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

type ArticleData = {
  title: string;
  site_name: string;
  url: string;
  author: string;
  description: string;
  image: string;
  content: string;
  html_content: string;
  publish_date: string;
  category: string;
  language: string;
  reading_time: number;
  scraped_at: string;
};

export default function Article() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/article?url=https://www.lanacion.com.ar/politica/la-cancilleria-pidio-la-inmediata-liberacion-del-gendarme-argentino-detenido-en-venezuela-nid13122024/`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch article: ${response.statusText}`);
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch article'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-white'>
        <div className='animate-pulse text-lg text-gray-600'>
          Loading article...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-white'>
        <div className='bg-red-50 p-6 rounded-lg text-red-700 max-w-md'>
          <h2 className='text-lg font-semibold mb-2'>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-white'>
        <div className='bg-gray-50 p-6 rounded-lg text-gray-600'>
          No article content available
        </div>
      </div>
    );
  }

  const formattedDate = article.publish_date
    ? new Date(article.publish_date).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className='min-h-screen bg-white'>
      <main className='max-w-3xl mx-auto px-4 py-12'>
        <article className='prose prose-slate lg:prose-lg prose-headings:font-serif prose-p:font-normal prose-p:leading-relaxed mx-auto'>
          <header className='not-prose mb-12'>
            <h1 className='text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight'>
              {article.title}
            </h1>

            <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-6'>
              {article.author && (
                <span className='font-medium'>{article.author}</span>
              )}
              {formattedDate && (
                <time dateTime={article.publish_date}>{formattedDate}</time>
              )}
              {article.site_name && <span>{article.site_name}</span>}
            </div>

            {article.description && (
              <p className='text-xl text-gray-700 leading-relaxed font-serif'>
                {article.description}
              </p>
            )}
          </header>

          {article.image && (
            <figure className='my-8 not-prose'>
              <img
                src={article.image}
                alt={article.title}
                className='w-full h-auto rounded-lg shadow-lg'
              />
            </figure>
          )}

          <div className='mt-8'>
            {article.html_content ? (
              <div
                dangerouslySetInnerHTML={{ __html: article.html_content }}
                className='prose-img:rounded-lg prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-blue-500'
              />
            ) : article.content ? (
              <div className='prose-p:my-4 prose-p:leading-relaxed whitespace-pre-wrap'>
                {article.content}
              </div>
            ) : (
              <p className='text-gray-500 italic'>No content available</p>
            )}
          </div>
        </article>

        <footer className='mt-12 pt-6 border-t border-gray-200 not-prose'>
          <div className='flex flex-wrap gap-2 items-center text-sm'>
            {article.category && (
              <span className='bg-gray-100 px-3 py-1.5 rounded-full text-gray-700'>
                {article.category}
              </span>
            )}
            {article.reading_time && (
              <span className='bg-gray-100 px-3 py-1.5 rounded-full text-gray-700'>
                {article.reading_time} min read
              </span>
            )}
            {article.language && (
              <span className='bg-gray-100 px-3 py-1.5 rounded-full text-gray-700'>
                {article.language.toUpperCase()}
              </span>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
