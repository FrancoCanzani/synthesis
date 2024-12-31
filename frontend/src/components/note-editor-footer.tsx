import { formatDate } from "@/lib/helpers";
import { Note } from "@/lib/types";
import { Editor } from "@tiptap/core";
import { LoaderCircle, Save } from "lucide-react";
import { useSearchParams } from "react-router";

export default function NoteEditorFooter({
  isSaving,
  editor,
  currentNote,
}: {
  isSaving: boolean;
  editor: Editor;
  currentNote: Note | undefined;
}) {
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("editorMode");
  return (
    <footer className="flex w-full items-center justify-between border-t bg-[--sidebar-background] px-2.5 py-1.5 text-xs">
      <div className="flex items-center gap-x-2">
        {mode !== "read" && (
          <div title={isSaving ? "Saving..." : "Saved"}>
            {isSaving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
          </div>
        )}
        {currentNote && (
          <div className="hidden items-center gap-x-2 sm:flex">
            <span>Created ‧ {formatDate(currentNote.created_at)}</span>/
            <span>Updated ‧ {formatDate(currentNote.updated_at)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <p>{editor.storage.characterCount.characters()} characters</p>
        <span>/</span>
        <p>{editor.storage.characterCount.words()} words</p>
      </div>
    </footer>
  );
}
