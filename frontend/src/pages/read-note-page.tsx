import { ToggleReaderThemeButton } from "@/components/toggle-reader-theme-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/helpers";
import { useAuth } from "@/lib/hooks/use-auth";
import { useNotesStore } from "@/lib/store/use-notes-store";
import { Note } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReadNotePage() {
  const { id: noteId } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const { fetchNotes } = useNotesStore();

  useEffect(() => {
    if (user && !loading) {
      fetchNotes(user.id);
    }
  }, [user, loading, fetchNotes]);

  useEffect(() => {
    async function fetchPublicNote() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/notes/public/${noteId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }

        const note = await res.json();
        setNote(note);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublicNote();
  }, [noteId]);

  return (
    <>
      <header className="flex w-full items-center justify-between space-x-2 border-b bg-background px-2 py-1.5">
        <div className="flex items-center justify-start space-x-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
        </div>
        <div className="flex items-center justify-end space-x-1">
          <ToggleReaderThemeButton />
        </div>
      </header>
      <main className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:pb-6">
          <article className="mx-auto p-2 sm:max-w-[80ch]">
            {isLoading ? (
              <ArticleSkeleton />
            ) : error ? (
              <ErrorAlert message={error} />
            ) : note ? (
              <>
                <div className="mb-4">
                  <h1 className="prose prose-2xl w-full font-medium text-black dark:prose-invert dark:text-white">
                    {note.title}
                  </h1>
                  <div className="flex items-center space-x-1 text-xs">
                    <span>Created ‧ {formatDate(note.created_at)}</span>
                    <span>Updated ‧ {formatDate(note.updated_at)}</span>
                  </div>
                </div>

                <div
                  className="prose prose-sm text-black dark:prose-invert sm:prose-base focus:outline-none dark:text-white sm:max-w-[80ch]"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </>
            ) : null}
          </article>
        </div>
      </main>
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="default" className="rounded-sm">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
