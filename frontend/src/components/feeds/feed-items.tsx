import { FeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import FeedGridItem from "./feed-grid-item";
import FeedRowItem from "./feed-row-item";

export default function FeedItems({
  feedItems,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: {
  feedItems: FeedItem[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  return (
    <div className="flex w-full flex-col space-y-2 md:h-[calc(100vh-theme(spacing.32))] md:w-2/3">
      <ScrollArea className="flex-1">
        <div className="h-full">
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {feedItems.map((item) => (
                <FeedGridItem item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {feedItems.map((item) => (
                <FeedRowItem item={item} key={item.id} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <div
        className={cn(
          "sticky bottom-0 flex items-center justify-center",
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
