import { extensions } from "@/lib/extensions";
import { formatDate, formatTextBeforeInsertion } from "@/lib/helpers";
import { useAuth } from "@/lib/hooks/use-auth";
import { useNotesStore } from "@/lib/store/use-note-store";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import debounce from "lodash/debounce";
import { LoaderCircle, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import AiAssistant from "./ai-assistant";
import NoteEditorHeader from "./note-editor-header";
import NoteEditorSideMenu from "./note-editor-side-menu";
import { RightSidebar } from "./right-sidebar";
import { Toolbar } from "./toolbar";

export default function NoteEditor() {
  const navigate = useNavigate();
  const { id: noteId } = useParams();
  const { user } = useAuth();
  const { notes, upsertNote } = useNotesStore();

  const [searchParams] = useSearchParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const mode = searchParams.get("editorMode");

  const currentNote = useMemo(
    () => notes?.find((note) => note.id === noteId),
    [notes, noteId],
  );

  const [localTitle, setLocalTitle] = useState(
    currentNote?.title || "Untitled",
  );
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: extensions as Extension[],
    editable: mode !== "read",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm text-black dark:text-white dark:prose-invert sm:prose-base sm:max-w-[80ch] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSaveContent(editor.getHTML());
    },
    onPaste: (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain");
      if (text) {
        const updatedText = formatTextBeforeInsertion(text);
        editor?.commands.insertContent(updatedText);
      }
    },
  });

  const debouncedSaveContent = useCallback(
    debounce(async (content: string) => {
      if (!user || !noteId) return;
      setIsSaving(true);
      await upsertNote({
        id: noteId,
        user_id: user.id,
        title: localTitle,
        content,
      });
      setIsSaving(false);
    }, 1000),
    [user, noteId, localTitle, upsertNote],
  );

  const debouncedSaveTitle = useCallback(
    debounce(async (newTitle: string) => {
      if (!user?.id || !noteId || !editor) return;
      setIsSaving(true);
      await upsertNote({
        id: noteId,
        user_id: user.id,
        title: newTitle,
        content: editor.getHTML(),
      });
      setIsSaving(false);
    }, 1000),
    [editor, noteId, upsertNote, user?.id],
  );

  useEffect(() => {
    if (!noteId || !notes?.length) return;
    if (!currentNote && !upsertNote) navigate("/notes");
  }, [noteId, notes, currentNote, navigate, upsertNote]);

  useEffect(() => {
    if (!editor) return;

    if (!currentNote) {
      editor.commands.setContent("");
      setLocalTitle("Untitled");
      return;
    }

    const isContentDifferent = editor.getHTML() !== currentNote.content;
    if (isContentDifferent) {
      editor.commands.setContent(currentNote.content || "");
    }
    setLocalTitle(currentNote.title || "Untitled");
  }, [noteId, editor, currentNote]);

  useEffect(() => {
    if (localTitle) debouncedSaveTitle(localTitle);
    return () => debouncedSaveTitle.cancel();
  }, [localTitle, debouncedSaveTitle]);

  if (!editor) return null;

  return (
    <div className="flex h-svh w-full">
      <div className="flex h-svh w-full flex-1 flex-col transition-transform duration-200">
        <NoteEditorHeader
          editor={editor}
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
        />
        {mode !== "read" && (
          <div className="sticky left-0 top-0 z-20 overflow-x-auto">
            <div className="flex min-w-max items-center justify-center px-2 pt-4">
              <Toolbar editor={editor} />
            </div>
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex flex-col items-center justify-start p-4 sm:max-w-[80ch]">
              {mode !== "read" ? (
                <input
                  type="text"
                  value={localTitle}
                  placeholder="Title"
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="prose prose-lg w-full bg-transparent px-4 font-medium text-black dark:prose-invert sm:prose-xl md:prose-2xl focus:outline-none dark:text-white"
                />
              ) : (
                <h1 className="prose prose-lg w-full bg-transparent px-4 font-medium text-black dark:prose-invert sm:prose-xl md:prose-2xl dark:text-white">
                  {localTitle}
                </h1>
              )}
              <NoteEditorSideMenu editor={editor} />
              <EditorContent editor={editor} className="w-full" />
            </div>
          </div>
        </div>
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
      </div>
      <RightSidebar open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
        <AiAssistant editor={editor} />
      </RightSidebar>
    </div>
  );
}
