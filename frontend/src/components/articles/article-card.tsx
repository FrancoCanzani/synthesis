import { getToken } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Globe } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import ArticleActions from "./article-actions";

const API_URL = import.meta.env.VITE_API_URL;

export default function ArticleCard({ article }: { article: Article }) {
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
      className="group relative flex flex-col overflow-hidden rounded-sm border bg-card transition-colors hover:bg-accent"
    >
      {article.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center gap-2">
          {article.favicon ? (
            <img
              src={article.favicon}
              alt=""
              className="h-6 w-6 rounded-sm object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=24&width=24";
              }}
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          {article.siteName && (
            <span className="text-sm text-muted-foreground">
              {article.siteName}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 flex-1 text-lg font-medium leading-tight">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <time>
            {formatDistanceToNowStrict(new Date(article.publishedTime), {
              addSuffix: true,
            })}
          </time>
          {article.label && <span className="underline">{article.label}</span>}
        </div>
      </div>
      <div className="absolute right-2 top-2">
        <ArticleActions
          article={article}
          onDelete={() => deleteArticleMutation.mutate(article.id)}
        />
      </div>
    </Link>
  );
}
