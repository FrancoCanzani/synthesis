import AddArticleDialog from "@/components/add-article-dialog";
import FeedbackState from "@/components/feedback-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { copyToClipboard, getToken, normalizeText } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { CheckCircle2, Ellipsis, Globe, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["articlesData"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/articles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  });

  const query = searchParams.get("q")?.toLowerCase() || "";

  const filteredArticles = data?.filter((article: Article) => {
    if (!query) return true;

    const normalizedTitle = normalizeText(article.title);
    const normalizedSiteName = article.siteName
      ? normalizeText(article.siteName)
      : "";
    const normalizedQuery = normalizeText(query);

    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedSiteName.includes(normalizedQuery)
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch overflow-y-auto p-3 md:p-4">
      <header className="bg-background p-3 md:p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">
              Articles
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Label className="sr-only">Search feeds</Label>
            <Input
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setSearchParams({ q: e.target.value })}
              className="hidden h-8 w-64 sm:block"
            />
            <AddArticleDialog />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1">
        {isPending ? (
          <div className="space-y-4 py-4">
            {[...Array(5)].map((_, i) => (
              <ArticleRowSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Failed to load articles
          </div>
        ) : filteredArticles?.length === 0 || !filteredArticles ? (
          <NoArticlesFound query={query} />
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col space-y-2 p-4">
            {filteredArticles?.map((article: Article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      {isFetching && !isPending && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground">
          <CheckCircle2 className="h-4 w-4 animate-pulse" />
          Updating...
        </div>
      )}
    </div>
  );
}

function NoArticlesFound({ query }: { query: string }) {
  return (
    <>
      {query ? (
        <FeedbackState
          type="empty"
          message={`No articles match your search for "${query}". Try a different search
                  term or add a new article.`}
        />
      ) : (
        <FeedbackState
          type="empty"
          message="You haven't added any articles yet. Start by adding your first
          article!"
        />
      )}
    </>
  );
}

function ArticleRow({ article }: { article: Article }) {
  const queryClient = useQueryClient();

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/articles?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articlesData"] });
      toast.success("Article deleted");
    },
    onError: () => {
      toast.error("Failed to delete article");
    },
  });

  return (
    <Link
      to={`/articles/${article.id}`}
      className="group relative flex min-h-[4rem] items-center gap-3 overflow-hidden rounded-sm bg-accent/20 p-3 transition-colors hover:bg-accent"
      title={article.title}
    >
      <div className="hidden flex-shrink-0 md:block">
        {article.favicon ? (
          <img
            src={article.favicon}
            alt=""
            className="h-8 w-8 rounded-sm object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=32&width=32";
            }}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium leading-tight">{article.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {article.siteName && (
            <>
              <span className="max-w-[200px] truncate">{article.siteName}</span>
              <span className="flex-shrink-0">‧</span>
            </>
          )}
          <time className="flex-shrink-0">
            {formatDistanceToNowStrict(new Date(article.publishedTime), {
              addSuffix: true,
            })}
          </time>
        </div>
      </div>

      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-100 transition-opacity hover:bg-white group-hover:opacity-100 dark:hover:bg-background sm:opacity-0"
            >
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Open options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem asChild>
              <Link to={`/articles/${article.id}`}>Read article</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Visit original
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async (e) => {
                e.stopPropagation();
                await copyToClipboard(article.url);
              }}
            >
              Copy url
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async (e) => {
                e.stopPropagation();
                deleteArticleMutation.mutate(article.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}

function ArticleRowSkeleton() {
  return (
    <div className="flex items-start gap-4 py-4">
      <Skeleton className="h-24 w-24 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
