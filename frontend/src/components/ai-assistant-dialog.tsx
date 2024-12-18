import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LoaderCircle,
  MoreHorizontal,
  SendHorizonal,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAiChat } from '@/lib/hooks/use-ai-chat';

export default function AiAssistantDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, handleInputChange, handleSubmit, inputPrompt, isLoading } =
    useAiChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleActionOnMessage = (messageId: string) => {
    const targetMessage = messages.find((msg) => msg.id === messageId);
    if (targetMessage) {
      handleSubmit();
    }
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
              <Wand2 className='h-4 w-4' />
              <span className='sr-only'>AI Assistant</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span className='text-xs'>AI Assistant</span>
        </TooltipContent>
      </Tooltip>

      <DialogContent className='sm:max-w-[550px] p-2 flex flex-col w-full max-w-md mx-auto text-sm'>
        <div className='flex-1 overflow-hidden'>
          <div className='h-[400px] overflow-y-auto p-2 rounded-md bg-muted/20'>
            {messages.length > 0 ? (
              <div className='space-y-2'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-1.5',
                        message.role === 'user'
                          ? 'bg-primary/90 dark:bg-primary/30 text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <div className='flex items-start justify-between'>
                        <p className='text-sm whitespace-pre-wrap'>
                          {message.content}
                        </p>
                        {message.role === 'assistant' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-auto p-0 ml-2'
                              >
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleActionOnMessage(message.id)
                                }
                              >
                                Provide context
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleActionOnMessage(message.id)
                                }
                              >
                                Rewrite message
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleActionOnMessage(message.id)
                                }
                              >
                                Summarize message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  No AI-generated content yet. Enter a prompt below.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-3 border-t pt-4 pb-2'>
          <input
            value={inputPrompt}
            onChange={handleInputChange}
            placeholder='Ask the AI assistant...'
            className='flex-1 outline-none px-2 bg-transparent'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            disabled={inputPrompt.length === 0}
            onClick={() => handleSubmit()}
            className={cn(
              'pr-2',

              { 'opacity-70': inputPrompt.length === 0 }
            )}
          >
            {isLoading ? (
              <LoaderCircle className='animate-spin' size={20} />
            ) : (
              <SendHorizonal size={20} />
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
