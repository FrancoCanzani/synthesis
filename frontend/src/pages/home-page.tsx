import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const newNoteId = uuidv4();

  return (
    <div className="m-auto mx-auto flex h-4/5 flex-1 flex-col items-stretch justify-center space-y-4 overflow-y-auto text-xl lg:text-2xl">
      <p className="font-medium">Select a note to start editing</p>
      <span className="italic">or</span>
      <div>
        Create a{" "}
        <Link className="font-medium underline" to={`/notes/${newNoteId}`}>
          new
        </Link>{" "}
        canvas
      </div>
    </div>
  );
}
