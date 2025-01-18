import FeedbackState from "@/components/feedback-state";
import FeedItems from "@/components/feeds/feed-items";
import FeedsPageHeader from "@/components/feeds/feeds-page-header";
import { getToken } from "@/lib/helpers";
import { FeedItem } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedsPage() {
  const [searchParams] = useSearchParams();

  const fetchFeedItems = async ({ pageParam }: { pageParam: number }) => {
    const limit = 50;
    const order = searchParams.get("order") === "asc" ? "ASC" : "DESC";
    const token = await getToken();
    const res = await fetch(
      `${API_URL}/feeds?order=${order}&limit=${limit}&offset=${pageParam}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch feeds");
    }

    return res.json();
  };

  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feedItems", searchParams.get("order")],
    queryFn: fetchFeedItems,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage.length === 50 ? pages.length * 50 : undefined;
    },
    initialPageParam: 0,
  });

  const feedItems: FeedItem[] =
    data?.pages
      .filter((page): page is FeedItem[] => page !== null)
      .flat()
      .filter((item): item is FeedItem => item !== null) ?? [];

  const unreadItems = feedItems.filter((item) => item.read === false);

  if (isPending)
    return <FeedbackState type="loading" message="Loading feeds" />;
  if (error)
    return (
      <FeedbackState
        type="error"
        message={`Error loading feeds: ${error.message}`}
      />
    );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch p-3 md:p-4 lg:p-5">
      <FeedsPageHeader
        isFetchingNextPage={isFetchingNextPage}
        isPending={isPending}
        unreadItems={unreadItems}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-1">
        {feedItems.length > 0 ? (
          <FeedItems
            feedItems={feedItems}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        ) : (
          <FeedbackState
            type="empty"
            message="You have no feeds available. Add one to see posts."
          />
        )}
      </div>
    </div>
  );
}
