import { getToken } from "@/lib/helpers";
import { Article } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Globe } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import ArticleActions from "./article-actions";

const API_URL = import.meta.env.VITE_API_URL;

export default function ArticleRow({ article }: { article: Article }) {
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
      <div>
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
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center justify-start space-x-1">
            {article.label && <span className="">{article.label}</span>}
            {article.label && <span className="">‧</span>}
            {article.siteName && (
              <>
                <span className="max-w-[200px] truncate">
                  {article.siteName}
                </span>
              </>
            )}
          </div>
          <time className="flex-shrink-0">
            {formatDistanceToNowStrict(new Date(article.publishedTime), {
              addSuffix: true,
            })}
          </time>
        </div>
      </div>

      <ArticleActions
        article={article}
        onDelete={() => deleteArticleMutation.mutate(article.id)}
      />
    </Link>
  );
}
