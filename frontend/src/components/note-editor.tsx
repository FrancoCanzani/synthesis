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
  const { currentNote, notes, upsertNote, fetchNote, fetchNotes } =
    useNotesStore();
  const [localTitle, setLocalTitle] = useState(
    currentNote?.title || 'Untitled'
  );

  const editor = useEditor({
    extensions: extensions as Extension[],
    content: currentNote?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none',
      },
    },
  });

  // Fetch note only if it's not in the store
  useEffect(() => {
    if (!noteId || !user) return;

    const noteExists = notes.some((note) => note.id === noteId);
    if (!noteExists && !currentNote) {
      fetchNote(noteId).catch(() => {
        navigate('/notes');
      });
    }
  }, [noteId, user, notes, currentNote, fetchNote, navigate]);

  useEffect(() => {
    if (editor && currentNote) {
      if (editor.getHTML() !== currentNote.content) {
        editor.commands.setContent(currentNote.content);
      }
      setLocalTitle(currentNote.title);
    }
  }, [editor, currentNote]);

  const debouncedSaveContent = useCallback(
    debounce((content: string) => {
      if (!user || !noteId) return;

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
      if (!user || !noteId || !editor) return;

      upsertNote({
        id: noteId,
        user_id: user.id,
        title: title,
        content: editor.getHTML(),
      });

      fetchNotes(noteId);
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
      editor.off('update', handler);
    };
  }, [editor, debouncedSaveContent]);

  useEffect(() => {
    return () => {
      debouncedSaveContent.cancel();
      debouncedSaveTitle.cancel();
    };
  }, [debouncedSaveContent, debouncedSaveTitle]);

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
