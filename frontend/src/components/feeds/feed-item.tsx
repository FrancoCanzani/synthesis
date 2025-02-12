import { useIsMobile } from "@/lib/hooks/use-mobile";
import { type FeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Star } from "lucide-react";
import FeedItemSheet from "./feed-item-sheet";

export default function FeedItem({
  item,
  handleSelectedFeedItem,
}: {
  item: FeedItem;
  handleSelectedFeedItem: (id: number) => void;
}) {
  const isMobile = useIsMobile();

  const date = new Date(
    item.publishedParsed || item.updatedParsed || item.createdAt,
  );

  if (isMobile) {
    <FeedItemSheet
      item={item}
      handleSelectedFeedItem={handleSelectedFeedItem}
    />;
  }

  return (
    <div
      className={cn(
        "group flex w-full cursor-pointer flex-col items-start justify-between space-y-2 overflow-hidden rounded-sm bg-accent/20 p-2 text-sm transition-all hover:bg-accent",
        item.read && "opacity-60",
      )}
      onClick={() => handleSelectedFeedItem(item.id)}
    >
      <div className="flex w-full min-w-0 items-center justify-between space-x-3">
        <h4 className="truncate font-medium">{item?.title}</h4>
        {item.starred && (
          <Star
            className="h-3 w-3"
            fill={item.starred ? "#fbbf24" : "none"}
            stroke={item.starred ? "#fbbf24" : "currentColor"}
          />
        )}
      </div>
      <div className="flex w-full items-center justify-between text-muted-foreground">
        <p className="mt-1 truncate text-xs">{item.feed.title}</p>
        <span className="text-xs">{format(date, "PP")}</span>
      </div>
    </div>
  );
}
