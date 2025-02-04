import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate, getToken } from "@/lib/helpers";
import { urlSchema } from "@/lib/schemas";
import { Article } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddArticleDialog() {
  const [urlInput, setUrlInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [article, setArticle] = useState<Article | null>(null);

  const queryClient = useQueryClient();

  const fetchArticleMutation = useMutation({
    mutationFn: async (url: string) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/articles?url=${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch article");
      return response.json();
    },
    onSuccess: (data) => {
      setArticle(data);
    },
    onError: () => {
      toast.error("Failed to fetch article");
    },
  });

  const saveArticleMutation = useMutation({
    mutationFn: async (article: Article) => {
      const token = await getToken();

      const response = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...article,
          id: uuid(),
          label: labelInput.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to save article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articlesData"] });
      toast.success("Article saved successfully");
    },
    onError: () => {
      toast.error("Failed to save article");
    },
  });

  async function getArticle(url: string) {
    const result = urlSchema.safeParse(url.trim());
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    fetchArticleMutation.mutate(url);
  }

  function handleReset() {
    setUrlInput("");
    setLabelInput("");
    setArticle(null);
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          handleReset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add article
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-auto flex w-full max-w-md flex-col gap-y-4 px-4 pb-4 pt-4 text-sm sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add new article</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter article URL"
                className="h-9 w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    getArticle(urlInput);
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              size={"sm"}
              type="button"
              className="h-9"
              onClick={() => getArticle(urlInput)}
              disabled={fetchArticleMutation.isPending || !urlInput}
            >
              Fetch
            </Button>
          </div>

          {article && (
            <div className="flex items-center gap-2">
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Add a label (optional)"
                className="h-9 flex-1"
              />
              <Button
                variant="outline"
                size={"sm"}
                className="h-9"
                onClick={() => saveArticleMutation.mutate(article)}
                disabled={saveArticleMutation.isPending}
              >
                Save
              </Button>
            </div>
          )}
        </div>

        {article && (
          <div className="flex-1 overflow-hidden rounded-md border">
            <article className="h-[400px] overflow-y-auto rounded-sm bg-muted/20 p-2">
              <header>
                <h1 className="font-serif text-2xl font-bold leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center justify-start space-x-2 py-4 text-xs">
                  {article.author && <span>By {article.author}</span>}
                  {article.publishedTime && (
                    <time dateTime={article.publishedTime}>
                      {formatDate(article.publishedTime)}
                    </time>
                  )}
                </div>

                {article.excerpt && (
                  <p className="leading-relaxed">{article.excerpt}</p>
                )}
              </header>

              {article.image && (
                <figure className="my-8">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-auto w-full rounded-sm"
                  />
                </figure>
              )}

              <div className="prose mt-4 max-w-none lg:prose-lg dark:text-white/80">
                {article.content ? (
                  <div
                    className="prose-sm whitespace-pre-wrap prose-p:my-4 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                ) : article.textContent ? (
                  <div className="prose-sm whitespace-pre-wrap prose-p:my-4 prose-p:leading-relaxed">
                    {article.textContent}
                  </div>
                ) : (
                  <p className="italic">No content available</p>
                )}
              </div>
            </article>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
