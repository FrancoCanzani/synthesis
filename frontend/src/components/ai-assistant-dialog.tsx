import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, SendHorizonal, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AiAssistantDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const streamAiResponse = useCallback(() => {
    setIsStreaming(true);
    setGeneratedContent('');
    setError(null);

    const eventSource = new EventSource(
      `${API_URL}/ai/generate?prompt=${encodeURIComponent(prompt)}`
    );

    eventSource.onmessage = (event) => {
      if (event.data.startsWith('Error:')) {
        setError(event.data);
        eventSource.close();
        setIsStreaming(false);
        return;
      }

      setGeneratedContent((prev) => {
        const updatedContent = prev + event.data;
        return updatedContent;
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsStreaming(false);
      setPrompt('');
    };

    return () => {
      eventSource.close();
      setIsStreaming(false);
      setPrompt('');
    };
  }, [prompt]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <Sparkles className='h-4 w-4' />
              <span className='sr-only'>AI Generate</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <span className='text-xs'>AI Generate</span>
        </TooltipContent>
      </Tooltip>

      <DialogContent className='sm:max-w-[550px] p-2 flex flex-col w-full max-w-md mx-auto stretch'>
        <div
          className='h-[400px] whitespace-pre-wrap overflow-y-scroll p-2'
          ref={messagesContainerRef}
        >
          <div className='space-y-2 min-h-full'>
            {generatedContent && (
              <div className='rounded-md bg-muted/30 h-full p-4'>
                <p className='text-sm whitespace-pre-wrap'>
                  {generatedContent}
                </p>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} className='shrink-0' />
        </div>
        <div className='px-2 pt-2 border-t'>
          <div className='flex items-center space-x-2'>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Prompt'
              className='border-0 p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  streamAiResponse();
                }
              }}
            />
            <Button
              disabled={prompt.length == 0 || isStreaming}
              variant={'ghost'}
              size={'icon'}
              onClick={streamAiResponse}
            >
              {isStreaming ? (
                <LoaderCircle className='animate-spin' />
              ) : (
                <SendHorizonal />
              )}
              <span className='sr-only'>Send</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
