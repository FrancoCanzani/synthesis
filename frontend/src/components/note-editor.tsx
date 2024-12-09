import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import { useAuth } from '@/lib/hooks/use-auth';
import { extensions } from '@/lib/extensions';
import { Separator } from '@/components/ui/separator';
import { Toolbar } from '@/components/toolbar';
import debounce from 'lodash/debounce';
import { useNotesStore } from '@/lib/store/use-note-store';
import { SidebarTrigger } from './ui/sidebar';

export default function NoteEditor() {
  const navigate = useNavigate();
  const { id: noteId } = useParams();
  const { user } = useAuth();
  const { notes, upsertNote, fetchNotes } = useNotesStore();

  const currentNote = notes.find((note) => note.id === noteId);
  const [localTitle, setLocalTitle] = useState(
    currentNote?.title || 'Untitled'
  );

  const editor = useEditor({
    extensions: extensions as Extension[],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(currentNote?.content ?? '');
      setLocalTitle(currentNote?.title ?? 'Untitled');
    }
  }, [noteId, editor, currentNote]);

  useEffect(() => {
    if (!noteId || !notes.length) return;
    if (!currentNote && !upsertNote) {
      navigate('/notes');
    }
  }, [noteId, notes, currentNote, navigate, upsertNote]);

  const debouncedSaveContent = useCallback(
    debounce(async (content: string) => {
      if (!user || !noteId) return;

      await upsertNote({
        id: noteId,
        user_id: user.id,
        title: localTitle,
        content: content,
      });
    }, 1000),
    [user, noteId, localTitle, upsertNote]
  );

  const debouncedSaveTitle = useCallback(
    debounce(async (newTitle: string) => {
      if (!user?.id || !noteId || !editor) return;

      try {
        await upsertNote({
          id: noteId,
          user_id: user.id,
          title: newTitle,
          content: editor.getHTML(),
        });
        await fetchNotes(user.id);
      } catch (error) {
        console.error('Failed to save title:', error);
      }
    }, 1000),
    [editor?.getHTML, fetchNotes, noteId, upsertNote, user?.id]
  );

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      debouncedSaveContent(editor.getHTML());
    };

    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
      debouncedSaveContent.cancel();
      debouncedSaveTitle.cancel();
    };
  }, [editor, debouncedSaveContent, debouncedSaveTitle]);

  useEffect(() => {
    if (localTitle) {
      debouncedSaveTitle(localTitle);
    }
  }, [localTitle, debouncedSaveTitle]);

  if (!editor) return null;

  return (
    <div className='border rounded-md pt-1.5 mb-3 min-h-full'>
      <header className='border-b flex items-center px-2 py-1.5 bg-background space-x-2'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='h-6' />
        <input
          placeholder='Title'
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          autoFocus
          className='flex-1 border-none outline-none bg-background'
        />
      </header>
      <main className='flex-1'>
        <div className='mx-auto pb-4'>
          <div className='flex w-full items-center py-2 px-2 border-b sticky top-0 left-0 bg-background z-20'>
            <Toolbar editor={editor} />
          </div>
          <EditorContent
            className='break-words whitespace-pre-wrap overflow-wrap-normal'
            editor={editor}
          />
        </div>
      </main>
    </div>
  );
}
