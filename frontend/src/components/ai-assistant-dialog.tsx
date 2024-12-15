import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ArrowRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickPrompts = [
  { label: 'Draft a haiku', shortcut: '⌘H' },
  { label: 'Create list', shortcut: '⌘L' },
  { label: 'Write summary', shortcut: '⌘S' },
];

export default function AiAssistantDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamAiResponse = useCallback(() => {
    setIsStreaming(true);
    setGeneratedContent('');
    setError(null);

    const eventSource = new EventSource(
      `http://localhost:8080/ai/generate?prompt=${encodeURIComponent(prompt)}`
    );

    eventSource.onmessage = (event) => {
      if (event.data.startsWith('Error:')) {
        setError(event.data);
        eventSource.close();
        setIsStreaming(false);
        return;
      }

      setGeneratedContent((prev) => prev + event.data);
    };

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setIsStreaming(false);
        eventSource.close();
        return;
      }

      setError('Stream error occurred');
      eventSource.close();
      setIsStreaming(false);
    };

    return () => {
      eventSource.close();
      setIsStreaming(false);
    };
  }, [prompt]);

  useEffect(() => {
    return () => setIsStreaming(false);
  }, []);

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

      <DialogContent className='sm:max-w-[550px] p-0'>
        <div className='p-4 border-b'>
          <div className='flex items-center space-x-2'>
            <Search className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Generate content...'
              className='border-0 p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  streamAiResponse();
                }
              }}
            />
          </div>
        </div>

        <ScrollArea className='h-[300px] p-4'>
          <div className='space-y-4'>
            {!prompt && !generatedContent && (
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground px-2'>
                  Quick Actions
                </p>
                {quickPrompts.map((item, index) => (
                  <Button
                    key={index}
                    variant='ghost'
                    className='w-full justify-between text-sm font-normal h-9 px-2'
                    onClick={() => setPrompt(item.label)}
                  >
                    <span>{item.label}</span>
                    <span className='text-xs text-muted-foreground'>
                      {item.shortcut}
                    </span>
                  </Button>
                ))}
              </div>
            )}

            {error && (
              <div className='px-2 py-1 text-sm text-red-600 bg-red-50 rounded'>
                {error}
              </div>
            )}

            {generatedContent && (
              <div className='space-y-2 px-2'>
                <div className='rounded-md bg-muted/50 p-4'>
                  <p className='text-sm whitespace-pre-wrap'>
                    {generatedContent}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-between text-xs h-8'
                  onClick={handleInsert}
                >
                  <span>Insert into note</span>
                  <ArrowRight className='h-3 w-3' />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {prompt && !isStreaming && !generatedContent && (
          <div className='p-4 border-t'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-between text-xs h-8'
              onClick={streamAiResponse}
              disabled={isStreaming}
            >
              <span>{isStreaming ? 'Generating...' : 'Generate'}</span>
              <ArrowRight className='h-3 w-3' />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
