import { useNotesStore } from "@/lib/store/use-note-store";
import { Note } from "@/lib/types";
import { LockIcon, LockOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { v4 } from "uuid";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function PublishNoteButton() {
  const { notes, upsertNote } = useNotesStore();
  const { id: noteId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentNote: Note | undefined = useMemo(
    () => notes?.find((note) => note.id === noteId),
    [notes, noteId],
  );

  const publicUrl = currentNote?.public_url
    ? `http://localhost:5173/notes/${currentNote.public_url}`
    : "Not available";

  async function togglePublish() {
    if (!currentNote) return;

    setIsLoading(true);

    if (currentNote.public) {
      try {
        await upsertNote({
          ...currentNote,
          public: false,
          public_url: null,
        });
        toast.success("Note unpublished successfully");
      } catch {
        toast.error("Failed to unpublish note");
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await upsertNote({
          ...currentNote,
          public: true,
          public_url: currentNote.public_url || v4().substring(0, 8),
        });
        toast.success("Note published successfully");
      } catch {
        toast.error("Failed to publish note");
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function refreshUrl() {
    if (!currentNote || !currentNote.public) return;

    setIsLoading(true);

    try {
      await upsertNote({
        ...currentNote,
        public_url: v4().substring(0, 8),
      });
      toast.success("Public URL refreshed successfully");
    } catch {
      toast.error("Failed to refresh public URL");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent/50"
        >
          {currentNote?.public ? (
            <LockOpen className="h-4 w-4" />
          ) : (
            <LockIcon className="h-4 w-4" />
          )}
          <span className="sr-only">
            {currentNote?.public ? "Public" : "Private"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {currentNote?.public && (
          <>
            <DropdownMenuItem>
              <span>URL: {publicUrl}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Copy URL</DropdownMenuItem>
            <DropdownMenuItem>Visit</DropdownMenuItem>
            <DropdownMenuItem onClick={refreshUrl}>
              Refresh URL
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={togglePublish}>
          {currentNote?.public ? "Unpublish" : "Publish"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
