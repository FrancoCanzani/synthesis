import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Article() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/article?url=https://www.lanacion.com.ar/economia/cuanto-hay-que-ganar-para-ser-de-clase-media-en-buenos-aires-nid11122024/`
        );
        if (!response.ok) throw new Error('Failed to fetch article');
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        setArticle(data);
      } catch (error) {
        console.error('Fetch error:', error); // Debug log
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, []);

  // Debug logs
  console.log('Current article state:', article);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!article) {
    return <div>No article data</div>;
  }

  // Destructure the data we need
  const {
    title,
    site_title,
    author,
    description,
    image,
    content,
    publish_date,
    category,
    reading_time,
    headings,
  } = article;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <header className='mb-8'>
        <h1 className='text-4xl font-bold mb-4'>{title}</h1>
        <div className='flex items-center gap-4 text-gray-600 mb-4'>
          {author && (
            <div>
              Por <span className='font-medium'>{author}</span>
            </div>
          )}
          <div>{new Date(publish_date).toLocaleDateString('es-AR')}</div>
          <div>{site_title}</div>
        </div>
        {description && <p className='text-xl text-gray-700'>{description}</p>}
      </header>

      {image && (
        <div className='mb-8'>
          <img src={image} alt={title} className='w-full h-auto rounded-lg' />
        </div>
      )}

      <article className='prose prose-lg max-w-none'>
        {content &&
          content.split('. ').map(
            (paragraph, index) =>
              paragraph.trim() && (
                <p key={index} className='mb-4'>
                  {paragraph.trim()}.
                </p>
              )
          )}
      </article>

      <footer className='mt-8 pt-8 border-t border-gray-200'>
        <div className='flex gap-4'>
          {category && (
            <span className='bg-gray-100 px-3 py-1 rounded-full'>
              {category}
            </span>
          )}
          <span className='bg-gray-100 px-3 py-1 rounded-full'>
            {reading_time} min de lectura
          </span>
        </div>

        {headings && headings.length > 0 && (
          <div className='mt-8'>
            <h2 className='text-xl font-bold mb-4'>Más en {site_title}</h2>
            <ul className='space-y-2'>
              {headings.slice(3).map((heading, index) => (
                <li key={index} className='text-gray-700'>
                  • {heading}
                </li>
              ))}
            </ul>
          </div>
        )}
      </footer>
    </div>
  );
}
