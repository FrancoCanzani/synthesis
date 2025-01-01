import { copyToClipboard } from "@/lib/helpers";
import { useNotesStore } from "@/lib/store/use-notes-store";
import { Note } from "@/lib/types";
import {
  Copy,
  ExternalLink,
  LockIcon,
  LockOpen,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { v4 } from "uuid";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function PublishNoteDialog() {
  const { notes, upsertNote } = useNotesStore();
  const { id: noteId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentNote: Note | undefined = useMemo(
    () => notes?.find((note) => note.id === noteId),
    [notes, noteId],
  );

  const publicId = currentNote?.public_id
    ? `${window.location.origin}/read/${currentNote.public_id}`
    : "Not available";

  async function togglePublish() {
    if (!currentNote) return;

    setIsLoading(true);

    const updatedNote = {
      ...currentNote,
      public: !currentNote.public,
      public_id: currentNote.public ? null : v4().substring(0, 8),
    };

    try {
      await upsertNote(updatedNote);
      toast.success(
        `Note ${updatedNote.public ? "published" : "unpublished"} successfully`,
      );
    } catch {
      toast.error(
        `Failed to ${updatedNote.public ? "publish" : "unpublish"} note`,
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUrl() {
    if (!currentNote || !currentNote.public) return;

    setIsLoading(true);

    try {
      await upsertNote({
        ...currentNote,
        public_id: v4().substring(0, 8),
      });
      toast.success("Public URL refreshed successfully");
    } catch {
      toast.error("Failed to refresh public URL");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tooltip>
      <Dialog>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
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
                {currentNote?.public ? "Manage public note" : "Publish note"}
              </span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span> {currentNote?.public ? "Public note" : "Private note"}</span>
        </TooltipContent>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-medium">
              {currentNote?.public ? "Manage Public Note" : "Publish Note"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {currentNote?.public ? (
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="public-url"
                    className="text-sm font-medium text-gray-700"
                  >
                    Public URL
                  </Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      type="text"
                      id="public-url"
                      value={publicId}
                      readOnly
                      disabled
                      className="flex-1 rounded-none rounded-l-md"
                    />
                    <Button
                      type="button"
                      onClick={async () => {
                        await copyToClipboard(publicId);
                        toast.success("URL copied to clipboard");
                      }}
                      className="rounded-none rounded-r-md px-3"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(publicId, "_blank")}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshUrl}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh URL
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/70">
                Public notes are accessible to anyone with the link. The content
                will be automatically decrypted when accessed.
              </p>
            )}

            {currentNote?.public && <Separator className="my-6" />}

            <Button
              variant={"outline"}
              onClick={togglePublish}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : currentNote?.public ? (
                <LockIcon className="mr-2 h-4 w-4" />
              ) : (
                <LockOpen className="mr-2 h-4 w-4" />
              )}
              {currentNote?.public ? "Unpublish Note" : "Publish Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tooltip>
  );
}
