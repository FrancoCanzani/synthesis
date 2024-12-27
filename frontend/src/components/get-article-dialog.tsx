import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Newspaper,
  LoaderCircle,
  SendHorizonal,
  Calendar,
  User,
  FilePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToolbar } from './toolbars/toolbar-provider';
import { Article } from '@/lib/types';
import { urlSchema } from '@/lib/schemas';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export default function GetArticleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const { editor } = useToolbar();

  const formattedDate = article?.publish_date
    ? new Date(article.publish_date).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  async function getArticle(url: string) {
    const result = urlSchema.safeParse(input.trim());

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/article?url=${url}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      const article = await response.json();
      setArticle(article);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        setArticle(null);
        setInput('');
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className={cn(
                'h-8 w-8 hover:bg-accent/50',
                isOpen && 'bg-accent/50'
              )}
            >
              <Newspaper className='h-4 w-4' />
              <span className='sr-only'>Get article</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Get article</span>
        </TooltipContent>
      </Tooltip>

      <DialogContent className='sm:max-w-[550px] p-2 flex flex-col w-full max-w-md mx-auto text-sm'>
        {article ? (
          <div className='flex-1 overflow-hidden'>
            <article className='h-[400px] overflow-y-auto p-2 rounded-sm bg-muted/20'>
              <header className='mb-8'>
                <h1 className='text-2xl font-serif font-bold mb-6 leading-tight'>
                  {article.title}
                </h1>
                <div className='flex flex-wrap items-center gap-6 text-sm mb-6'>
                  {article.author && (
                    <div className='flex items-center gap-2'>
                      <User className='w-4 h-4' />
                      <span>{article.author}</span>
                    </div>
                  )}
                  {formattedDate && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4' />
                      <time dateTime={article.publish_date}>
                        {formattedDate}
                      </time>
                    </div>
                  )}
                </div>

                {article.description && (
                  <p className='leading-relaxed font-serif'>
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
                {article.content ? (
                  <div className='prose-p:my-4 prose-p:leading-relaxed whitespace-pre-wrap prose-sm'>
                    {article.content}
                  </div>
                ) : (
                  <p className='italic'>No content available</p>
                )}
              </div>
            </article>
          </div>
        ) : (
          <div className='h-[50px] flex items-center justify-center'>
            <p className='text-muted-foreground'>
              Enter an article URL to insert it in your notes
            </p>
          </div>
        )}
        <div className='flex items-center space-x-3 border-t pt-4 pb-2'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Enter article URL'
            className='flex-1 outline-none px-2 bg-transparent'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                getArticle(input);
              }
            }}
          />
          <div className='flex items-center justify-end'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => getArticle(input)}
              className={cn(
                'h-7 w-7 hover:bg-accent/50',

                { 'opacity-70': input.length === 0 }
              )}
            >
              {isLoading ? (
                <LoaderCircle className='animate-spin' size={20} />
              ) : (
                <SendHorizonal size={20} />
              )}
            </Button>
            {article && (
              <Button
                variant='ghost'
                size='icon'
                className={cn('h-7 w-7 hover:bg-accent/50')}
                onClick={() => {
                  const updatedText = article.content.replace(/\n/g, '<br/>');
                  editor.commands.insertContent(updatedText);
                  setIsOpen(false);
                  setArticle(null);
                  setInput('');
                }}
                title='Insert into note'
              >
                <FilePlus className='h-4 w-4' />
                <span className='sr-only'>Insert into note</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
