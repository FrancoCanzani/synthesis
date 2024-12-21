import { Editor } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import { BlockquoteToolbar } from '@/components/toolbars/blockquote';
import { BoldToolbar } from '@/components/toolbars/bold';
import { BulletListToolbar } from '@/components/toolbars/bullet-list';
import { CodeToolbar } from '@/components/toolbars/code';
import { CodeBlockToolbar } from '@/components/toolbars/code-block';
import { HardBreakToolbar } from '@/components/toolbars/hard-break';
import { HorizontalRuleToolbar } from '@/components/toolbars/horizontal-rule';
import { ItalicToolbar } from '@/components/toolbars/italic';
import { OrderedListToolbar } from '@/components/toolbars/ordered-list';
import { RedoToolbar } from '@/components/toolbars/redo';
import { UndoToolbar } from './toolbars/undo';
import { StrikeThroughToolbar } from '@/components/toolbars/strikethrough';
import { ToolbarProvider } from '@/components/toolbars/toolbar-provider';
import { UnderlineToolbar } from './toolbars/underline';
import { TableToolbar } from './toolbars/table';
import { TextAlignToolbar } from './toolbars/text-align';
import { HeadingToolbar } from './toolbars/heading';
import { HighlightToolbar } from './toolbars/highlight';
import { LinkToolbar } from './toolbars/link';
import AiAssistantDialog from './ai-assistant-dialog';
import { SearchAndReplaceToolbar } from './toolbars/search-and-replace-toolbar';
import { ColorHighlightToolbar } from './toolbars/color-and-highlight';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <ToolbarProvider editor={editor}>
      <div className='flex items-center gap-2'>
        <UndoToolbar />
        <RedoToolbar />
        <Separator orientation='vertical' className='h-7' />
        <AiAssistantDialog />
        <Separator orientation='vertical' className='h-7' />
        <ColorHighlightToolbar />
        <HeadingToolbar />
        <BoldToolbar />
        <ItalicToolbar />
        <UnderlineToolbar />
        <StrikeThroughToolbar />
        <HighlightToolbar />
        <TextAlignToolbar />
        <LinkToolbar />
        <BulletListToolbar />
        <OrderedListToolbar />
        <TableToolbar />
        <CodeToolbar />
        <CodeBlockToolbar />
        <HorizontalRuleToolbar />
        <BlockquoteToolbar />
        <HardBreakToolbar />
        <SearchAndReplaceToolbar />
      </div>
    </ToolbarProvider>
  );
}
