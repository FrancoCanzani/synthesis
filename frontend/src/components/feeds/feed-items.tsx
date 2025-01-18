import { FeedItem } from "@/lib/types";
import { useSearchParams } from "react-router";
import { Button } from "../ui/button";
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
    <div className="w-full">
      <div>
        {view == "grid" ? (
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
      <div className="flex items-center justify-center py-4">
        <Button
          variant={"ghost"}
          size={"sm"}
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading more feeds..." : "Load more feeds"}
        </Button>
      </div>
    </div>
  );
}
