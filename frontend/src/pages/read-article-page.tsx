import { ToggleReaderThemeButton } from "@/components/toggle-reader-theme-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getToken } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReadArticlePage() {
  const { id: articleId } = useParams();

  const {
    isPending,
    error,
    data: article,
  } = useQuery<Article, Error>({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
  });

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
            {isPending ? (
              <ArticleSkeleton />
            ) : error ? (
              <ErrorAlert
                message={
                  error instanceof Error
                    ? error.message
                    : "An unknown error occurred"
                }
              />
            ) : article ? (
              <>
                <div className="mb-4">
                  <h1 className="prose prose-2xl w-full font-medium text-black dark:prose-invert dark:text-white">
                    {article.title}
                  </h1>
                  <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      {article.favicon && (
                        <img src={article.favicon} alt="" className="h-4 w-4" />
                      )}
                      <span>{article.site_name}</span>
                    </div>
                    <span>By {article.author || "Unknown Author"}</span>
                    <span>Published: {formatDate(article.published_time)}</span>
                    {article.modified_time && (
                      <span>
                        Last modified: {formatDate(article.modified_time)}
                      </span>
                    )}
                    <span>Language: {article.language}</span>
                    <span>Length: {article.length} characters</span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary hover:underline"
                    >
                      <span>View original</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="mb-4 w-full rounded-md object-cover"
                  />
                )}

                {article.excerpt && (
                  <div className="mb-4 rounded-md bg-muted p-4 italic">
                    {article.excerpt}
                  </div>
                )}

                <div
                  className="prose prose-sm text-black dark:prose-invert sm:prose-base focus:outline-none dark:text-white sm:max-w-[80ch]"
                  dangerouslySetInnerHTML={{ __html: article.content }}
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
      <Skeleton className="h-64 w-full" />
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
