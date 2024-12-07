import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotesStore } from '@/lib/store/use-note-store';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function DeleteNoteDialog({ noteId }: { noteId: string }) {
  const { deleteNote } = useNotesStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    await deleteNote(noteId);
    navigate('/notes');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className='md:invisible md:group-hover/item:visible p-1 rounded-md bg-background/50 hover:bg-background'>
          <Trash size={14} />
          <span className='sr-only'>Delete</span>
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0 text-sm'>
          <Button
            variant='ghost'
            size={'sm'}
            className='h-7 px-2 py-1 hover:bg-accent'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            size={'sm'}
            className='h-7 px-2 py-1'
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
