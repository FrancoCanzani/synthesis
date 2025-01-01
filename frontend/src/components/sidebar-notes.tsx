import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/helpers";
import { useNotesStore } from "@/lib/store/use-note-store";
import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { LockIcon, LockOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import DeleteNoteDialog from "./delete-note-dialog";

function NoteContentPreview({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class:
          "[&_.ProseMirror]:!p-0 [&_.ProseMirror]:!m-0 [&_.ProseMirror_p]:!m-0",
      },
    },
  });

  return (
    <div className="max-h-[150px] overflow-y-auto rounded-md border bg-background/50 p-2 [&_.ProseMirror]:!m-0 [&_.ProseMirror]:!p-0 [&_.ProseMirror_p]:!m-0">
      <EditorContent editor={editor} />
    </div>
  );
}

export default function SidebarNotes() {
  const params = useParams();
  const notes = useNotesStore((state) => state.notes);
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col justify-start space-y-1">
      {notes?.map((note) => (
        <Tooltip key={note.id}>
          <TooltipTrigger asChild>
            <div className="group/item flex items-center rounded-md px-2 py-1 hover:bg-accent">
              <button
                className={cn(
                  "block flex-1 truncate pr-1 text-start text-sm",
                  params.id === note.id && "font-semibold",
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
            side="right"
            className="w-56 space-y-2 bg-accent p-2"
            sideOffset={10}
          >
            <div className="flex items-center justify-between">
              <h3 className="w-[90%] truncate font-medium">{note.title}</h3>
              {note?.public ? (
                <LockOpen className="h-3.5 w-3.5" />
              ) : (
                <LockIcon className="h-3.5 w-3.5" />
              )}
            </div>
            <NoteContentPreview content={note.content} />
            <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
              <span>Created ‧ {formatDate(note.created_at)}</span>
              <span>Updated ‧ {formatDate(note.updated_at)}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
