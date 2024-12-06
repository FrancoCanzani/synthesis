import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import { useAuth } from '@/lib/hooks/use-auth';
import { extensions } from '@/lib/extensions';
import { Separator } from '@/components/ui/separator';
import { Toolbar } from '@/components/toolbar';
import debounce from 'lodash/debounce';
import { useNotesStore } from '@/lib/store/use-note-store';
import { SidebarTrigger } from './ui/sidebar';

export default function NoteEditor() {
  const { id: noteId } = useParams();
  const { user } = useAuth();
  const { currentNote, fetchNote, upsertNote } = useNotesStore();
  const [localTitle, setLocalTitle] = useState('Untitled');

  const editor = useEditor({
    extensions: extensions as Extension[],
    content: '',
  });

  useEffect(() => {
    if (editor && currentNote) {
      editor.commands.setContent(currentNote.content);
    }
  }, [editor, currentNote]);

  useEffect(() => {
    if (currentNote?.title) {
      setLocalTitle(currentNote.title);
    }
  }, [currentNote]);

  const debouncedSaveContent = useCallback(
    debounce((content: string) => {
      if (!user) return;
      upsertNote({
        id: noteId,
        user_id: user.id,
        title: localTitle,
        content: content,
      });
    }, 1000),
    [user, noteId, localTitle, upsertNote]
  );

  const debouncedSaveTitle = useCallback(
    debounce((title: string) => {
      if (!user) return;
      upsertNote({
        id: noteId,
        user_id: user.id,
        title: title,
        content: editor?.getHTML() || '',
      });
    }, 1000),
    [user, noteId, editor, upsertNote]
  );

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      debouncedSaveContent(editor.getHTML());
    };

    editor.on('update', handler);
    return () => {
      editor.off('update');
    };
  }, [editor, debouncedSaveContent]);

  useEffect(() => {
    if (!noteId || !editor || !user) return;
    fetchNote(noteId);
  }, [noteId, editor, user, fetchNote]);

  if (!editor) return null;

  return (
    <div className='border rounded-md pt-1.5 mb-3 min-h-full'>
      <header className='border-b flex items-center px-4 py-1.5 bg-background space-x-2'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='h-6' />
        <input
          placeholder='Title'
          value={localTitle}
          onChange={(e) => {
            setLocalTitle(e.target.value);
            debouncedSaveTitle(e.target.value);
          }}
          autoFocus
          className='flex-1 border-none outline-none bg-background'
        />
      </header>
      <main className='flex-1'>
        <div className='mx-auto pb-4'>
          <div className='flex w-full items-center py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20'>
            <Toolbar editor={editor} />
          </div>
          <EditorContent className='overflow-y-auto' editor={editor} />
        </div>
      </main>
    </div>
  );
}
