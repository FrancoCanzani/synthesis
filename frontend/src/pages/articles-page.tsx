import AddArticleDialog from "@/components/articles/add-article-dialog";
import ArticleCard from "@/components/articles/article-card";
import ArticleRow from "@/components/articles/article-row";
import FeedbackState from "@/components/feedback-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getToken, normalizeText } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, LayoutGrid, LayoutList, XCircle } from "lucide-react";
import { useSearchParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "row";
  const query = searchParams.get("q") || "";

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

  const setView = (newView: string) => {
    setSearchParams((prev) => {
      prev.set("view", newView);
      return prev;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      if (event.target.value) {
        prev.set("q", event.target.value);
      } else {
        prev.delete("q");
      }
      return prev;
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch p-3 md:p-4 lg:p-5">
      <header className="mb-8 flex w-full flex-wrap items-center justify-between gap-4">
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
            onChange={handleSearchChange}
            className="hidden h-8 w-64 sm:block"
          />
          <div
            className={cn(
              "flex items-center gap-2 border-r pr-2 sm:border-x sm:px-2",
            )}
          >
            <Button
              variant={view === "row" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("row")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <AddArticleDialog />
        </div>
      </header>

      <main className="mx-auto w-full flex-1">
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
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles?.map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex w-full flex-1 flex-col space-y-2 divide-y">
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
