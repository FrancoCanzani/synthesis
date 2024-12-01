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
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import { extensions } from '@/lib/extensions';
import { useAuth } from '@/lib/hooks/use-auth';
import { useEffect } from 'react';

const content = `
<h2 class="tiptap-heading" style="text-align: center">Hello world</h2>
`;

export default function Editor() {
  const handleChange = () => console.log('change');
  const { user } = useAuth();

  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    immediatelyRender: false,
    onUpdate: handleChange,
  });

  if (!editor) {
    return null;
  }
  return (
    <>
      <div className='flex w-full items-center py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20'>
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
      </div>
      <EditorContent className='overflow-y-auto' editor={editor} />
    </>
  );
}
