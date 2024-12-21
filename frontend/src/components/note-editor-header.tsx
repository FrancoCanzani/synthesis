import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import { SearchAndReplaceToolbar } from './toolbars/search-and-replace-toolbar';
import { ToolbarProvider } from './toolbars/toolbar-provider';
import { Editor } from '@tiptap/core';
import AiAssistantDialog from './ai-assistant-dialog';
import { TextToSpeechToolbar } from './toolbars/text-to-speech';

export default function NoteEditorHeader({ editor }: { editor: Editor }) {
  return (
    <header className='border-b flex items-center justify-between w-full px-2 py-1.5 bg-background space-x-2'>
      <div className='flex items-center justify-start space-x-2'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='h-6' />
      </div>
      <div>
        <ToolbarProvider editor={editor}>
          <AiAssistantDialog />
          <TextToSpeechToolbar />
          <SearchAndReplaceToolbar />
        </ToolbarProvider>
      </div>
    </header>
  );
}
