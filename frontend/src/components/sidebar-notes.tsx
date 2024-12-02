import useSWR from 'swr';
import { fetcher } from '@/lib/helpers';
import { useAuth } from '@/lib/hooks/use-auth';
import { Note } from '@/lib/types';
import { Link } from 'react-router';

export default function SidebarNotes() {
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

  console.log(notes);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className='space-y-1'>
      {notes?.map((note) => (
        <Link
          key={note.id}
          to={`/notes/${note.id}`}
          className='block px-2 py-1 text-sm hover:bg-accent rounded-md'
        >
          {note.title}
        </Link>
      ))}
    </div>
  );
}
