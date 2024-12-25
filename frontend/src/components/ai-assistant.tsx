import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, MoreHorizontal, SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAiChat } from '@/lib/hooks/use-ai-chat';
import { copyToClipboard } from '@/lib/helpers';
import { Editor } from '@tiptap/core';
import { Separator } from './ui/separator';

export default function AiAssistant({ editor }: { editor: Editor }) {
  const {
    messages,
    setMessages,
    handleInputChange,
    handleSubmit,
    inputPrompt,
    isLoading,
  } = useAiChat(editor.getText());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const applyAIResponse = (
    content: string,
    mode: 'insert' | 'replace' | 'append'
  ) => {
    const { view } = editor;
    const { from, to } = view.state.selection;

    switch (mode) {
      case 'insert':
        editor.commands.insertContent(content);
        break;
      case 'replace':
        editor.commands.command(({ tr }) => {
          tr.replaceWith(from, to, editor.schema.text(content));
          return true;
        });
        break;
      case 'append':
        editor.commands.insertContentAt(
          editor.state.doc.content.size,
          '\n\n' + content
        );
        break;
    }
  };

  return (
    <div className='pb-2 flex flex-col w-full mx-auto text-sm h-full'>
      <div className='border-b flex items-center justify-between w-full px-2 py-1.5 bg-background space-x-2'>
        <h3 className='font-medium'>AI Assistant</h3>
        <div className='flex items-center justify-start space-x-2'>
          <Separator orientation='vertical' className='h-6' />
          <Button
            variant='ghost'
            size='sm'
            className='h-8'
            onClick={() => setMessages([])}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto p-2'>
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
                      'max-w-[95%] rounded-md px-3 py-1.5',
                      message.role === 'user'
                        ? 'bg-primary/90 dark:bg-primary/20 text-primary-foreground'
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
                              onClick={() => copyToClipboard(message.content)}
                            >
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                applyAIResponse(message.content, 'insert')
                              }
                            >
                              Insert at cursor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                applyAIResponse(message.content, 'replace')
                              }
                            >
                              Replace selection
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                applyAIResponse(message.content, 'append')
                              }
                            >
                              Append to note
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
            <div className='flex flex-col items-center justify-center h-full'>
              <p className='text-sm text-center text-muted-foreground text-balance'>
                No AI-generated content yet. Enter a prompt below.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center space-x-3 border-t pt-3 pb-1 px-2'>
        <input
          value={inputPrompt}
          onChange={handleInputChange}
          placeholder='Ask the AI assistant...'
          className='flex-1 outline-none bg-transparent'
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
          className={cn('pr-2', { 'opacity-70': inputPrompt.length === 0 })}
        >
          {isLoading ? (
            <LoaderCircle className='animate-spin' size={17} />
          ) : (
            <SendHorizonal size={17} />
          )}
        </button>
      </div>
    </div>
  );
}
