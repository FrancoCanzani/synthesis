import { copyToClipboard } from "@/lib/helpers";
import { FeedItem as FeedItemType } from "@/lib/types";
import { formatDistanceToNowStrict } from "date-fns";
import { Check, Copy, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface FeedItemProps {
  item: FeedItemType;
}

export function FeedItem({ item }: FeedItemProps) {
  const parsedDate = item.published
    ? new Date(item.published)
    : item.published_parsed
      ? new Date(item.published_parsed)
      : null;

  const formattedDate =
    parsedDate && !isNaN(parsedDate.getTime())
      ? formatDistanceToNowStrict(parsedDate)
      : "Unknown Date";

  return (
    <div
      className={`w-full px-4 py-1 pl-8 hover:bg-muted/25 ${item.read ? "opacity-60" : ""}`}
    >
      <div className="flex w-full items-center justify-between">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-4/6 truncate text-sm font-medium hover:underline"
        >
          {item.title}
        </a>
        <div className="flex w-2/6 items-center justify-end gap-x-1 text-xs">
          <Button variant={"ghost"} size={"sm"} className="h-8 w-8">
            {item.read ? (
              <X className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span className="sr-only">{item.starred ? "Unstar" : "Star"}</span>
          </Button>
          <Button variant={"ghost"} size={"sm"} className="h-8 w-8">
            {item.starred ? (
              <Star className="h-4 w-4" fill="#fcdf03" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            <span className="sr-only">{item.starred ? "Unstar" : "Star"}</span>
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="h-8 w-8"
            onClick={async () => {
              await copyToClipboard(item.link);
              toast.success("URL copied to clipboard");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <span className="px-3">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
