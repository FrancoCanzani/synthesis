import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNotesStore } from "@/lib/store/use-notes-store";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function DeleteNoteDialog({ noteId }: { noteId: string }) {
  const { deleteNote } = useNotesStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    await deleteNote(noteId);
    toast.success("Note deleted successfully");
    navigate("/home");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-md bg-background/50 p-1 hover:bg-background md:invisible md:group-hover/item:visible">
          <Trash size={14} />
          <span className="sr-only">Delete</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 text-sm sm:gap-0">
          <Button
            variant="outline"
            size={"sm"}
            className="h-7 px-2 py-1 hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            className="h-7 bg-red-100 px-2 py-1 hover:bg-red-200"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
