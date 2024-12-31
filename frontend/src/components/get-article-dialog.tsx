import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatTextBeforeInsertion } from "@/lib/helpers";
import { urlSchema } from "@/lib/schemas";
import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FilePlus, LoaderCircle, Newspaper, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useToolbar } from "./toolbars/toolbar-provider";

const API_URL = import.meta.env.VITE_API_URL;

export default function GetArticleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const { editor } = useToolbar();

  async function getArticle(url: string) {
    const result = urlSchema.safeParse(input.trim());

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/article?url=${url}`);
      if (!response.ok) throw new Error("Failed to fetch article");
      const article = await response.json();
      console.log(article);

      setArticle(article);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 hover:bg-accent/50",
                isOpen && "bg-accent/50",
              )}
            >
              <Newspaper className="h-4 w-4" />
              <span className="sr-only">Get article</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Get article</span>
        </TooltipContent>
      </Tooltip>

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
                          alt={article.site_name}
                          className="h-4 w-4 rounded-sm"
                        />
                      </figure>
                    )}
                  </div>
                  {article.published_time && (
                    <time dateTime={article.published_time}>
                      Published {formatDate(article.published_time)}
                    </time>
                  )}
                  {article.modified_time && (
                    <time dateTime={article.published_time}>
                      Modified {formatDate(article.published_time)}
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
                ) : article.text_content ? (
                  <div className="prose-sm whitespace-pre-wrap prose-p:my-4 prose-p:leading-relaxed">
                    {article.text_content}
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
              Paste an article URL to get its content in your note.
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
              className={cn(
                "h-7 w-7 hover:bg-accent/50",

                { "opacity-70": input.length === 0 },
              )}
            >
              {isLoading ? (
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
                onClick={() => {
                  const content = formatTextBeforeInsertion(article.content);
                  editor.commands.insertContent(content);
                  setIsOpen(false);
                  setArticle(null);
                  setInput("");
                }}
                title="Insert into note"
              >
                <FilePlus className="h-4 w-4" />
                <span className="sr-only">Insert into note</span>
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
