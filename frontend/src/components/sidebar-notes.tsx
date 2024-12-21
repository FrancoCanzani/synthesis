import { useNavigate } from 'react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useParams } from 'react-router';
import { cn } from '@/lib/utils';
import { useNotesStore } from '@/lib/store/use-note-store';
import DeleteNoteDialog from './delete-note-dialog';

function NoteContentPreview({ content }: { content: string }) {
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
    <div className='max-h-[150px] bg-background/50 border  rounded-md p-2 overflow-y-auto [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!m-0 [&_.ProseMirror_p]:!m-0'>
      <EditorContent editor={editor} />
    </div>
  );
}

export default function SidebarNotes() {
  const params = useParams();
  const notes = useNotesStore((state) => state.notes);
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-1 flex-col flex w-full justify-start'>
      {notes?.map((note) => (
        <Tooltip key={note.id}>
          <TooltipTrigger asChild>
            <div className='group/item flex items-center hover:bg-accent rounded-md px-2 py-1'>
              <button
                className={cn(
                  'block text-sm text-start truncate flex-1 pr-1',
                  params.id === note.id && 'font-semibold'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/notes/${note.id}`);
                }}
              >
                {note.title}
              </button>
              <DeleteNoteDialog noteId={note.id} />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side='right'
            className='w-56 p-2 space-y-2 bg-accent'
            sideOffset={10}
          >
            <h3 className='font-medium'>{note.title}</h3>
            <NoteContentPreview content={note.content} />
            <div className='text-xs text-muted-foreground flex flex-col space-y-1'>
              <span>Created - {formatDate(note.created_at)}</span>
              <span>Updated - {formatDate(note.updated_at)}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
