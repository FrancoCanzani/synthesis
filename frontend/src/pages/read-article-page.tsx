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
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <article className="prose dark:prose-invert prose-headings:scroll-mt-20">
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
            <header className="mb-4 space-y-4">
              <div className="flex w-full items-center justify-between">
                {article.label && (
                  <span className="text-sm underline">{article.label}</span>
                )}
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                  >
                    Read original
                  </a>
                )}
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
                {article.title}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  {article.favicon && (
                    <img
                      src={article.favicon}
                      alt={article.siteName}
                      className="h-5 w-5 rounded-sm"
                    />
                  )}
                  <span className="font-medium">{article.siteName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {article.author && <span>By {article.author}</span>}
                  <time dateTime={article.publishedTime}>
                    {formatDate(article.publishedTime)}
                  </time>
                </div>
              </div>
            </header>

            {article.image && (
              <figure className="my-4">
                <img
                  src={article.image}
                  alt={article.title}
                  className="aspect-video w-full rounded-sm object-cover"
                />
              </figure>
            )}

            {article.excerpt && (
              <div className="my-8 rounded-sm bg-accent p-4 font-medium leading-relaxed">
                {article.excerpt}
              </div>
            )}

            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </>
        ) : null}
      </article>
    </main>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-4 py-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-4 py-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="rounded-lg">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
