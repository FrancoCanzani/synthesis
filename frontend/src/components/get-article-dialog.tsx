import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTextBeforeInsertion } from "@/lib/helpers";
import { urlSchema } from "@/lib/schemas";
import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FilePlus,
  LoaderCircle,
  Newspaper,
  SendHorizonal,
  User,
} from "lucide-react";
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

  const formattedDate = article?.publish_date
    ? new Date(article.publish_date).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

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

      <DialogContent className="mx-auto flex w-full max-w-md flex-col p-2 text-sm sm:max-w-[550px]">
        {article ? (
          <div className="flex-1 overflow-hidden">
            <article className="h-[400px] overflow-y-auto rounded-sm bg-muted/20 p-2">
              <header className="mb-8">
                <h1 className="mb-6 font-serif text-2xl font-bold leading-tight">
                  {article.title}
                </h1>
                <div className="mb-6 flex flex-wrap items-center gap-6 text-sm">
                  {article.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={article.publish_date}>
                        {formattedDate}
                      </time>
                    </div>
                  )}
                </div>

                {article.description && (
                  <p className="font-serif leading-relaxed">
                    {article.description}
                  </p>
                )}
              </header>

              {article.image && (
                <figure className="my-8">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-auto w-full rounded-md"
                  />
                </figure>
              )}

              <div className="prose mt-8 max-w-none lg:prose-lg dark:text-white/80">
                {article.content ? (
                  <div className="prose-sm whitespace-pre-wrap prose-p:my-4 prose-p:leading-relaxed">
                    {article.content}
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
              Enter an article URL to insert it in your notes
            </p>
          </div>
        )}
        <div className="flex items-center space-x-3 border-t pb-2 pt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter article URL"
            className="flex-1 bg-transparent px-2 outline-none"
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
              onClick={() => getArticle(input)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
