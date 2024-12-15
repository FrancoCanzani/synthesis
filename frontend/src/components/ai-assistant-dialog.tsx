import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, SendHorizonal, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL;

export default function AiAssistantDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

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
        // Use setTimeout to ensure DOM has updated
        setTimeout(scrollToBottom, 0);
        return prev + event.data;
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

  const handleInsert = () => {
    // TipTap insertion logic here
    setIsOpen(false);
  };

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
              <Sparkles className='h-4 w-4 text-muted-foreground' />
              <span className='sr-only'>AI Generate</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <span className='text-xs'>AI Generate</span>
        </TooltipContent>
      </Tooltip>

      <DialogContent className='sm:max-w-[550px] p-2'>
        <ScrollArea className='h-[400px]' ref={scrollRef}>
          <div className='space-y-2 min-h-full'>
            {generatedContent && (
              <div className='rounded-md bg-muted/50 h-full p-2'>
                <p className='text-sm whitespace-pre-wrap'>
                  {generatedContent}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className='p-2 border-t'>
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
            <Button variant={'ghost'} size={'icon'}>
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
