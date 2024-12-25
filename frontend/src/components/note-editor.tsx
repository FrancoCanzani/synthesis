import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import { useAuth } from '@/lib/hooks/use-auth';
import { extensions } from '@/lib/extensions';
import debounce from 'lodash/debounce';
import { useNotesStore } from '@/lib/store/use-note-store';
import { Toolbar } from './toolbar';
import { formatDate } from '@/lib/helpers';
import { LoaderCircle, Save } from 'lucide-react';
import { useSearchParams } from 'react-router';
import NoteEditorHeader from './note-editor-header';
import { RightSidebar } from './right-sidebar';
import AiAssistant from './ai-assistant';
import { NoteEditorBubbleMenu } from './note-editor-bubble-menu';

export default function NoteEditor() {
  const navigate = useNavigate();
  const { id: noteId } = useParams();
  const { user } = useAuth();
  const { notes, upsertNote, fetchNotes } = useNotesStore();
  const [searchParams] = useSearchParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const mode = searchParams.get('editorMode');

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
          'prose prose-sm text-black dark:text-white dark:prose-invert sm:prose-base sm:max-w-[80ch] focus:outline-none',
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
    <div className='h-svh flex w-full'>
      <div className='h-svh flex flex-col flex-1 w-full transition-transform duration-200'>
        <NoteEditorHeader
          editor={editor}
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
        />
        {mode != 'read' && (
          <div className='sticky top-0 left-0 z-20 overflow-x-auto'>
            <div className='flex items-center justify-center pt-4 px-2 min-w-max'>
              <Toolbar editor={editor} />
            </div>
          </div>
        )}
        <div className='flex-1 flex overflow-hidden'>
          <div className='flex-1 overflow-y-auto'>
            <div className='p-4 flex items-center justify-start flex-col sm:max-w-[80ch] mx-auto'>
              {mode != 'read' ? (
                <input
                  type='text'
                  value={localTitle}
                  placeholder='Title'
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className='px-4 text-black dark:text-white font-medium bg-transparent focus:outline-none w-full prose prose-lg dark:prose-invert sm:prose-xl md:prose-2xl'
                />
              ) : (
                <h1 className='px-4 text-black dark:text-white font-medium bg-transparent w-full prose prose-lg dark:prose-invert sm:prose-xl md:prose-2xl'>
                  {localTitle}
                </h1>
              )}
              <NoteEditorBubbleMenu editor={editor} />
              <EditorContent editor={editor} className='w-full' />
            </div>
          </div>
        </div>
        <footer className='bg-[--sidebar-background] border-t flex items-center justify-between text-xs px-2.5 py-1.5 w-full'>
          <div className='flex items-center justify-start gap-x-2'>
            {mode != 'read' && (
              <div title={isSaving ? 'Saving...' : 'Saved'}>
                {isSaving ? (
                  <LoaderCircle size={17} className='animate-spin' />
                ) : (
                  <Save size={17} />
                )}
              </div>
            )}
            {currentNote && (
              <div className='sm:flex items-center justify-start gap-x-2 hidden'>
                <span>Created ‧ {formatDate(currentNote.created_at)}</span>/
                <span>Updated ‧ {formatDate(currentNote.updated_at)}</span>
              </div>
            )}
          </div>
          <div className='flex items-center justify-end space-x-2'>
            <p>{editor.storage.characterCount.characters()} characters</p>
            <span>/</span>
            <p>{editor.storage.characterCount.words()} words</p>
          </div>
        </footer>
      </div>

      <RightSidebar open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
        <AiAssistant editor={editor} />
      </RightSidebar>
    </div>
  );
}
