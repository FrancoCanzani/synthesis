import GetArticleDialog from "@/components/get-article-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { copyToClipboard, getToken } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { CheckCircle2, Ellipsis, Globe, XCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function ArticlesPage() {
  const [search, setSearch] = useState("");

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["articlesData"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/articles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  const filteredArticles = data?.filter(
    (article: Article) =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.site_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <h2 className="font-medium">Articles</h2>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <GetArticleDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
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
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No articles found
          </div>
        ) : (
          <div className="divide-y">
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
      className="flex items-center gap-3 bg-accent/50 p-3 transition-colors duration-300 hover:bg-accent"
    >
      {article.favicon ? (
        <img
          src={article.favicon}
          alt={article.title}
          className="h-8 w-8 rounded-sm object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
          <Globe className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{article.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{article.site_name}</span>‧
          <time>
            {formatDistanceToNowStrict(new Date(article.published_time))} ago
          </time>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={(e) => e.stopPropagation()}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white dark:hover:bg-background"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Open options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
            <Link to={`/articles/${article.id}`}>Read article</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
            <a href={article.url}>Visit original</a>
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
            onClick={(e) => {
              e.stopPropagation();
              deleteArticleMutation.mutate(article.id);
            }}
            disabled={deleteArticleMutation.isPending}
          >
            {deleteArticleMutation.isPending ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
