import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import { SearchAndReplaceToolbar } from './toolbars/search-and-replace-toolbar';
import { ToolbarProvider } from './toolbars/toolbar-provider';
import { Editor } from '@tiptap/core';
import { TextToSpeechToolbar } from './toolbars/text-to-speech';
import GetArticleDialog from './get-article-dialog';
import { Dispatch, SetStateAction } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { BotMessageSquare } from 'lucide-react';

export default function NoteEditorHeader({
  editor,
  rightSidebarOpen,
  setRightSidebarOpen,
}: {
  editor: Editor;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className='border-b flex items-center justify-between w-full px-2 py-1.5 bg-background space-x-2'>
      <div className='flex items-center justify-start space-x-2'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='h-6' />
      </div>
      <div>
        <ToolbarProvider editor={editor}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className={cn(
                  'h-8 w-8 hover:bg-accent/50',
                  rightSidebarOpen && 'bg-accent/50'
                )}
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              >
                <BotMessageSquare className='h-4 w-4' />
                <span className='sr-only'>AI Assistant</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>AI Assistant</span>
            </TooltipContent>
          </Tooltip>
          <GetArticleDialog />
          <TextToSpeechToolbar />
          <SearchAndReplaceToolbar />
        </ToolbarProvider>
      </div>
    </header>
  );
}
