import { Ellipsis } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard } from "@/lib/helpers";
import { Article } from "@/lib/types";

export default function ArticleActions({
  article,
  onDelete,
}: {
  article: Article;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background"
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
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
