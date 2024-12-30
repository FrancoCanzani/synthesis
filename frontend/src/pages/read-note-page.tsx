import { AppSidebar } from "@/components/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/use-auth";
import { useNotesStore } from "@/lib/store/use-note-store";
import { Note } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
          if (res.status === 404) {
            throw new Error("Note not found");
          } else {
            throw new Error("Failed to fetch note");
          }
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-w-0 bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center border-b px-4 lg:h-[60px]">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <article className="mx-auto max-w-3xl">
              {isLoading ? (
                <ArticleSkeleton />
              ) : error ? (
                <ErrorAlert message={error} />
              ) : note ? (
                <>
                  <h1 className="mb-4 text-3xl font-bold">{note.title}</h1>
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </>
              ) : null}
            </article>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
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
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
