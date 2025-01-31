import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatDate, getToken } from "@/lib/helpers";
import { urlSchema } from "@/lib/schemas";
import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Save, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddArticleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
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
    onError: (error) => {
      console.error(error);
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
        }),
      });
      if (!response.ok) throw new Error("Failed to save article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articlesData"] });
      toast.success("Article saved successfully");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to save article");
    },
  });

  async function getArticle(url: string) {
    const result = urlSchema.safeParse(input.trim());
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    fetchArticleMutation.mutate(url);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        setArticle(null);
        setInput("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add article
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-auto flex w-full max-w-md flex-col gap-y-0 px-2 pb-0 pt-2 text-sm sm:max-w-[550px]">
        {article ? (
          <div className="flex-1 overflow-hidden">
            <article className="h-[400px] overflow-y-auto rounded-sm bg-muted/20 p-2">
              <header>
                <h1 className="font-serif text-2xl font-bold leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div className="flex items-center justify-start space-x-1">
                    {article.author && <span>By {article.author}</span>}
                    {article.image && (
                      <figure className="my-8">
                        <img
                          src={article.favicon}
                          alt={article.siteName}
                          className="h-4 w-4 rounded-sm"
                        />
                      </figure>
                    )}
                  </div>
                  {article.publishedTime && (
                    <time dateTime={article.publishedTime}>
                      Published {formatDate(article.publishedTime)}
                    </time>
                  )}
                  {article.modifiedTime && (
                    <time dateTime={article.modifiedTime}>
                      Modified {formatDate(article.modifiedTime)}
                    </time>
                  )}
                </div>

                {article.excerpt && (
                  <p className="font-serif leading-relaxed">
                    {article.excerpt}
                  </p>
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
        ) : (
          <div className="flex h-[50px] items-center justify-center">
            <p className="text-muted-foreground">
              Paste an article URL to get its content.
            </p>
          </div>
        )}
        <form className="flex items-center space-x-3 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter article URL"
            className="flex-1 bg-transparent px-2 py-4 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                getArticle(input);
              }
            }}
          />
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                getArticle(input);
              }}
              className={cn("h-7 w-7 hover:bg-accent/50", {
                "opacity-70": input.length === 0,
              })}
              disabled={fetchArticleMutation.isPending}
            >
              {fetchArticleMutation.isPending ? (
                <LoaderCircle className="animate-spin" size={20} />
              ) : (
                <SendHorizonal size={20} />
              )}
            </Button>
            {article && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className={cn("h-7 w-7 hover:bg-accent/50")}
                onClick={() => saveArticleMutation.mutate(article)}
                disabled={saveArticleMutation.isPending}
                title="Insert into note"
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">Save article</span>
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
