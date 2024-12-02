import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import { useAuth } from '@/lib/hooks/use-auth';
import { extensions } from '@/lib/extensions';
import debounce from 'lodash/debounce';
import { Note } from '@/lib/types';
import { Toolbar } from '@/components/toolbar';

const API_URL = import.meta.env.VITE_API_URL;

export default function NotesLayout() {
  const [noteTitle, setNoteTitle] = useState('Untitled');
  const params = useParams();
  const { user } = useAuth();
  const noteId = params.id;

  const upsertNote = useCallback(
    async (note: Partial<Note>): Promise<Note> => {
      try {
        const response = await fetch(`${API_URL}/notes/upsert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...note,
            id: noteId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save note');
        }

        return response.json();
      } catch (error) {
        console.error('Error saving note:', error);
        throw new Error('Failed to save note');
      }
    },
    [noteId]
  );

  const getNote = useCallback(async (id: string): Promise<Note> => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch note');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  }, []);

  const editor = useEditor({
    extensions: extensions as Extension[],
    content: '',
  });

  const saveNote = useCallback(
    (content?: string, title?: string) => {
      if (!user || !editor) return;

      const saveData = async () => {
        try {
          const noteData: Partial<Note> = {
            user_id: user.id,
            content: content ?? editor.getHTML(),
            title: title ?? noteTitle,
          };

          await upsertNote(noteData);
        } catch (error) {
          console.error('Failed to save note:', error);
        }
      };

      const debouncedSave = debounce(saveData, 1000);
      debouncedSave();
    },
    [user, editor, noteTitle, upsertNote]
  );

  useEffect(() => {
    if (!editor) return;

    editor.on('update', () => {
      saveNote(editor.getHTML());
    });

    return () => {
      editor.off('update');
    };
  }, [editor, saveNote]);

  useEffect(() => {
    if (!noteTitle) return;
    saveNote(undefined, noteTitle);
  }, [noteTitle, saveNote]);

  useEffect(() => {
    if (!noteId || !editor || !user) return;

    const loadNote = async () => {
      try {
        const note = await getNote(noteId);
        if (note.user_id !== user.id) {
          throw new Error('Unauthorized');
        }
        editor.commands.setContent(note.content);
        setNoteTitle(note.title);
      } catch (error) {
        console.error('Failed to load note:', error);
        editor.commands.setContent('');
        setNoteTitle('Untitled');
      }
    };

    loadNote();
  }, [noteId, editor, user, getNote]);

  if (!editor) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='w-full flex bg-background'>
        <AppSidebar />
        <div className='flex-1 flex flex-col p-4 lg:p-6'>
          <div className='border rounded-md pt-1.5 mb-3 min-h-full'>
            <header className='border-b flex items-center px-4 py-1.5 bg-background space-x-2'>
              <SidebarTrigger />
              <Separator orientation='vertical' className='h-6' />
              <input
                placeholder='Title'
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                autoFocus
                className='flex-1 border-none outline-none'
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
        </div>
      </div>
    </SidebarProvider>
  );
}
