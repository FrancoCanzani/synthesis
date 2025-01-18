import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getToken } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch overflow-y-auto p-3 md:p-4">
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
            <div className="mb-6">
              <h2 className="prose prose-xl mb-4 text-xl font-medium text-black dark:prose-invert dark:text-white sm:text-2xl md:text-3xl">
                {article.title}
              </h2>
              <div className="flex flex-col items-start gap-x-1.5 space-y-2 text-xs text-muted-foreground md:flex-row md:items-center md:space-y-0">
                <div className="flex items-center md:space-x-1.5">
                  {article.favicon && (
                    <img
                      src={article.favicon}
                      alt={article.title}
                      className="hidden h-4 w-4 rounded-sm md:block"
                    />
                  )}
                  <span>{article.siteName}</span>
                </div>
                <span className="hidden md:block">‧</span>
                <span>By {article.author || "Unknown Author"}</span>
                <span className="hidden md:block">‧</span>
                <span>Published: {formatDate(article.publishedTime)}</span>
                <span className="hidden md:block">‧</span>
                {article.modifiedTime && (
                  <span className="hidden md:block">
                    Last modified: {formatDate(article.modifiedTime)}
                  </span>
                )}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:underline"
                >
                  View original
                </a>
              </div>
            </div>

            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="mb-4 w-full rounded-sm object-cover"
              />
            )}

            {article.excerpt && (
              <div className="mb-4 rounded-sm bg-muted p-4 italic">
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
    </main>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-2/3" />
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
