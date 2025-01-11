import { getToken } from "@/lib/helpers";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { FeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Check, Copy, ExternalLink, Share, Star, X } from "lucide-react";
import { toast } from "sonner";
import ActionButton from "./ui/action-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const API_URL = import.meta.env.VITE_API_URL;

const GROUP_ORDER = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Last Month",
  "Older",
];

export function FeedList({ feedItems }: { feedItems: FeedItem[] }) {
  const groupedItems = groupFeedItems(feedItems);

  return (
    <div className="w-full">
      <div className="space-y-6 p-4">
        {Object.entries(groupedItems)
          .sort((a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]))
          .map(([group, items]) => (
            <FeedGroup key={group} group={group} items={items as FeedItem[]} />
          ))}
      </div>
    </div>
  );
}

function FeedGroup({ group, items }: { group: string; items: FeedItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-start gap-4 py-2">
        <h2 className="text-sm font-medium text-muted-foreground">{group}</h2>
        <div className="flex-1 border-t border-border"></div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <FeedItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function FeedItemCard({ item }: { item: FeedItem }) {
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
    queryClient.invalidateQueries({ queryKey: ["feeds"] });

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
            "group cursor-pointer overflow-hidden rounded-sm bg-accent/20 transition-colors hover:bg-accent",
            item.read && "opacity-50",
          )}
        >
          <div className="flex w-full items-center justify-between gap-x-2 p-2">
            <div className="flex w-full items-center justify-start gap-4">
              <div className="flex w-full flex-col items-start justify-start gap-0.5">
                <div className="flex w-full items-center justify-between">
                  <p className="min-w-max truncate font-medium">{item.title}</p>
                </div>
                <div className="flex w-full items-center justify-between">
                  <p className="truncate text-sm text-muted-foreground">
                    {item.feed.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {format(date, "PP")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="w-full overflow-y-scroll md:max-w-2xl"
      >
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-xl font-bold">{item.title}</SheetTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{item.feed.title}</span>
              <span>‧</span>
              <time>
                {formatDistanceToNowStrict(
                  new Date(
                    item.publishedParsed ||
                      item.updatedParsed ||
                      item.createdAt,
                  ),
                  { addSuffix: true },
                )}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                tooltipContent={item.starred ? "Unstar" : "Star"}
                onClick={async () =>
                  await updatePostState(item.id, "starred", !item.starred)
                }
              >
                <Star
                  className="h-4 w-4"
                  fill={item.starred ? "#fff400" : "white"}
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
              <ActionButton tooltipContent="Copy link" onClick={() => {}}>
                <Copy className="h-4 w-4" />
              </ActionButton>
              <ActionButton tooltipContent="Share" onClick={() => {}}>
                <Share className="h-4 w-4" />
              </ActionButton>
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

function groupFeedItems(feedItems: FeedItem[]) {
  return feedItems.reduce(
    (groups, item) => {
      const date = new Date(
        item.publishedParsed || item.updatedParsed || item.createdAt,
      );
      const group = getGroupLabel(date);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, FeedItem[]>,
  );
}

function getGroupLabel(date: Date) {
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return "This Week";
  if (days <= 30) return "This Month";
  if (days <= 60) return "Last Month";
  return "Older";
}
