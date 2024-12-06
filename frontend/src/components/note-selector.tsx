import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router';

export default function NoteSelector() {
  const newNoteId = uuidv4();

  return (
    <div className='h-4/5 m-auto text-xl lg:text2  flex flex-col items-center space-y-8 justify-center mx-auto'>
      <p className='font-medium'>Select a note to start editing</p>
      <span className='italic'>or</span>
      <div>
        Create a{' '}
        <Link className='underline font-medium' to={`/notes/${newNoteId}`}>
          new
        </Link>{' '}
        canvas
      </div>
    </div>
  );
}
