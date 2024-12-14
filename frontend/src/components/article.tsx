import { Clock, Calendar, User, Globe, Folder } from 'lucide-react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { fetcher } from '@/lib/helpers';

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
  const {
    data: article,
    error,
    isLoading,
  } = useSWR<ArticleData>(
    `${API_URL}/article?url=https://www.lanacion.com.ar/politica/la-cancilleria-pidio-la-inmediata-liberacion-del-gendarme-argentino-detenido-en-venezuela-nid13122024/`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
          <div>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='p-6 rounded-md max-w-md'>
          <h2 className='text-lg font-semibold mb-2'>Error Loading Article</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='p-6 rounded-md'>No article content available</div>
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
    <div className='min-h-screen'>
      <article className='rounded-md p-8 max-w-4xl mx-auto'>
        <header className='mb-8'>
          <h1 className='text-4xl font-serif font-bold mb-6 leading-tight'>
            {article.title}
          </h1>

          <div className='flex flex-wrap items-center gap-6 text-sm mb-6'>
            {article.reading_time && (
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4' />
                <span>{article.reading_time} min read</span>
              </div>
            )}
            {article.author && (
              <div className='flex items-center gap-2'>
                <User className='w-4 h-4' />
                <span>{article.author}</span>
              </div>
            )}
            {formattedDate && (
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                <time dateTime={article.publish_date}>{formattedDate}</time>
              </div>
            )}
          </div>

          <div className='flex flex-wrap gap-4 mb-6'>
            {article.category && (
              <Badge
                variant='secondary'
                className='flex items-center rounded-md gap-2'
              >
                <Folder className='w-4 h-4' />
                <span>{article.category}</span>
              </Badge>
            )}
            {article.language && (
              <Badge
                variant='secondary'
                className='flex items-center rounded-md gap-2'
              >
                <Globe className='w-4 h-4' />
                <span>{article.language.toUpperCase()}</span>
              </Badge>
            )}
          </div>

          {article.description && (
            <p className='text-xl leading-relaxed font-serif'>
              {article.description}
            </p>
          )}
        </header>

        {article.image && (
          <figure className='my-8'>
            <img
              src={article.image}
              alt={article.title}
              className='w-full h-auto rounded-md'
            />
          </figure>
        )}

        <div className='mt-8 prose lg:prose-lg dark:text-white/80 max-w-none'>
          {article.html_content ? (
            <div
              dangerouslySetInnerHTML={{ __html: article.html_content }}
              className='prose-img:rounded-md prose-a:no-underline hover:prose-a:underline'
            />
          ) : article.content ? (
            <div className='prose-p:my-4 prose-p:leading-relaxed whitespace-pre-wrap'>
              {article.content}
            </div>
          ) : (
            <p className='italic'>No content available</p>
          )}
        </div>
      </article>
    </div>
  );
}
