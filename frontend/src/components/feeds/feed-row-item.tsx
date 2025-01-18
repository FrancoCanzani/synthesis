import { copyToClipboard, getToken } from "@/lib/helpers";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { FeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, Copy, ExternalLink, Star, X } from "lucide-react";
import { toast } from "sonner";
import ActionButton from "../ui/action-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import UnsubscribeFeedDialog from "./unsubscribe-feed-dialog";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedRowItem({ item }: { item: FeedItem }) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const date = new Date(
    item.publishedParsed || item.updatedParsed || item.createdAt,
  );

  async function updatePostState(
    id: number,
    attribute: string,
    value: boolean,
  ) {
    const token = await getToken();
    const response = await fetch(`${API_URL}/feeds`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ attribute, value, id }),
    });
    queryClient.invalidateQueries({ queryKey: ["feedItems"] });

    if (!response.ok) {
      toast.error("Failed to update post state");
    }

    return await response.json();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div
          className={cn(
            "group flex w-full cursor-pointer items-center justify-between gap-x-1.5 overflow-hidden bg-accent/20 px-1 py-2 text-sm transition-colors hover:bg-accent",
            item.read && "opacity-60",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center justify-start gap-x-1.5">
            <a href={item.feedLink} target="_blank" className="truncate">
              {item.feed.title}
            </a>
            <span>‧</span>
            <h4 className="min-w-0 flex-1 truncate font-medium">
              {item?.title}
            </h4>
          </div>
          <div className="flex flex-shrink-0 items-center justify-between gap-x-1.5">
            {item.starred && (
              <Star
                className="h-4 w-4"
                fill={item.starred ? "#fff400" : "white"}
                stroke={item.starred ? "#fbbf24" : "currentColor"}
              />
            )}
            <span>{format(date, "PP")}</span>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-[85%] w-full overflow-y-scroll md:max-h-full md:max-w-2xl"
      >
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-xl font-bold">{item?.title}</SheetTitle>
          <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
            <div className="flex w-full items-center gap-x-1.5 text-sm text-muted-foreground md:w-1/2">
              <span className="truncate">{item.feed.title}</span>
              <span>‧</span>
              <UnsubscribeFeedDialog
                feedLink={item.feedLink}
                feedTitle={item.feed.title}
              />
            </div>
            <div className="flex w-full items-center justify-end gap-x-1.5 md:w-fit">
              <ActionButton
                tooltipContent={item.starred ? "Unstar" : "Star"}
                onClick={async () =>
                  await updatePostState(item.id, "starred", !item.starred)
                }
              >
                <Star
                  className="h-4 w-4"
                  fill={item.starred ? "#fff400" : "white"}
                  stroke={item.starred ? "#fbbf24" : "currentColor"}
                />
              </ActionButton>
              <ActionButton
                tooltipContent={item.read ? "Mark as unread" : "Mark as read"}
                onClick={async () =>
                  await updatePostState(item.id, "read", !item.read)
                }
              >
                {item.read ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </ActionButton>
              {item.link && (
                <ActionButton
                  tooltipContent="Copy link"
                  onClick={async () => {
                    if (item.link) {
                      try {
                        await copyToClipboard(item.link);
                        toast.success("Link copied to clipboard");
                      } catch {
                        toast.error("Error copying link");
                      }
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </ActionButton>
              )}
              <a
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full rounded-sm object-cover"
            />
          )}
          <article className="prose dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: item.description || "" }} />
            <div dangerouslySetInnerHTML={{ __html: item.content || "" }} />
          </article>
        </div>
      </SheetContent>
    </Sheet>
  );
}
