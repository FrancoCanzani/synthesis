import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import { useAuth } from '@/lib/hooks/use-auth';
import { extensions } from '@/lib/extensions';
import debounce from 'lodash/debounce';
import { useNotesStore } from '@/lib/store/use-note-store';
import { Toolbar } from './toolbar';
import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import { LoaderCircle, Save } from 'lucide-react';

export default function NoteEditor() {
  const navigate = useNavigate();
  const { id: noteId } = useParams();
  const { user } = useAuth();
  const { notes, upsertNote, fetchNotes } = useNotesStore();

  const currentNote = notes.find((note) => note.id === noteId);
  const [localTitle, setLocalTitle] = useState(
    currentNote?.title || 'Untitled'
  );
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: extensions as Extension[],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert sm:prose-base sm:max-w-[80ch] mx-auto focus:outline-none',
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
      setIsSaving(true);

      if (!user || !noteId) return;

      await upsertNote({
        id: noteId,
        user_id: user.id,
        title: localTitle,
        content: content,
      });
      setIsSaving(false);
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
        setIsSaving(false);
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
    return () => {
      debouncedSaveTitle.cancel();
    };
  }, [localTitle, debouncedSaveTitle]);

  if (!editor) return null;

  return (
    <div className='h-svh flex flex-col'>
      <header className='border-b flex items-center px-2 py-1.5 bg-background space-x-2'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='h-6' />
        <input
          placeholder='Title'
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          autoFocus
          className='flex-1 border-none outline-none bg-background min-w-0'
        />
      </header>
      <div className='sticky top-0 left-0 bg-background z-20 border-b overflow-x-auto'>
        <div className='flex items-center py-2 px-2 min-w-max'>
          <Toolbar editor={editor} />
        </div>
      </div>
      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 overflow-y-auto'>
          <div className='p-4' onClick={() => editor.commands.focus()}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      <footer className='bg-[--sidebar-background] border-t flex items-center justify-between text-xs px-2 py-1.5 w-full'>
        <div title={isSaving ? 'Saving...' : 'Saved'}>
          {isSaving ? (
            <LoaderCircle size={17} className='animate-spin' />
          ) : (
            <Save size={17} />
          )}
        </div>
        <div className='flex items-center justify-end space-x-2'>
          <p>{editor.storage.characterCount.characters()} characters</p>
          <span>/</span>
          <p>{editor.storage.characterCount.words()} words</p>
        </div>
      </footer>
    </div>
  );
}
