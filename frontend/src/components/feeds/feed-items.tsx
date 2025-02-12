import { type FeedItem as FeedItemType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import FeedItem from "./feed-item";

export default function FeedItems({
  feedItems,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  handleSelectedFeedItem,
}: {
  feedItems: FeedItemType[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  handleSelectedFeedItem: (id: number) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-3">
        <div className="divide-y">
          {feedItems.map((item) => (
            <FeedItem
              item={item}
              key={item.id}
              handleSelectedFeedItem={handleSelectedFeedItem}
            />
          ))}
        </div>
      </div>
      <div
        className={cn(
          "sticky bottom-0 flex items-center justify-center bg-white/50 backdrop-blur-sm", // Add some styling for visibility
          !hasNextPage && "hidden",
        )}
      >
        <Button
          disabled={isFetchingNextPage}
          variant="ghost"
          size="sm"
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading more feeds..." : "Load more feeds"}
        </Button>
      </div>
    </div>
  );
}
