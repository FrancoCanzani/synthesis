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
        <BoldToolbar />
        <ItalicToolbar />
        <StrikeThroughToolbar />
        <BulletListToolbar />
        <OrderedListToolbar />
        <CodeToolbar />
        <CodeBlockToolbar />
        <HorizontalRuleToolbar />
        <BlockquoteToolbar />
        <HardBreakToolbar />
      </div>
    </ToolbarProvider>
  );
}
