import useSWR from 'swr';
import { fetcher } from '@/lib/helpers';
import { useAuth } from '@/lib/hooks/use-auth';
import { Note } from '@/lib/types';
import { Link } from 'react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useParams } from 'react-router';
import { cn } from '@/lib/utils';

function NotePreview({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class:
          '[&_.ProseMirror]:!p-0 [&_.ProseMirror]:!m-0 [&_.ProseMirror_p]:!m-0',
      },
    },
  });

  return (
    <div className='max-h-[150px] bg-background/50 border rounded-md p-2 overflow-y-auto [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!m-0 [&_.ProseMirror_p]:!m-0'>
      <EditorContent editor={editor} />
    </div>
  );
}

export default function SidebarNotes() {
  const params = useParams();

  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const {
    data: notes,
    error,
    isLoading,
  } = useSWR<Note[]>(
    user?.id ? `${apiUrl}/notes/all/${user.id}` : null,
    fetcher
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className='space-y-1 flex-col flex w-full justify-start'>
      {notes?.map((note) => (
        <Tooltip key={note.id}>
          <TooltipTrigger asChild>
            <Link
              to={`/notes/${note.id}`}
              className={cn(
                'block px-2 py-1 text-sm text-start hover:bg-accent rounded-md',
                params.id === note.id && 'font-semibold'
              )}
            >
              {note.title}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side='right'
            className='w-56 p-4 space-y-2 bg-accent'
            sideOffset={10}
          >
            <h3 className='font-medium'>{note.title}</h3>
            <NotePreview content={note.content} />
            <div className='text-xs text-muted-foreground'>
              Created {formatDate(note.created_at)}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
