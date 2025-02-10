import FeedbackState from "@/components/feedback-state";
import FeedItems from "@/components/feeds/feed-items";
import FeedsLeftPanel from "@/components/feeds/feeds-left-panel";
import FeedsPageHeader from "@/components/feeds/feeds-page-header";
import { getToken } from "@/lib/helpers";
import { FeedItem } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedsPage() {
  const [searchParams] = useSearchParams();
  const currentTimeRange = searchParams.get("timeRange") ?? "all";
  const currentLabel = searchParams.get("label") ?? "all";
  const currentFeed = searchParams.get("feed") ?? "all";

  const fetchFeedItems = async ({ pageParam }: { pageParam: number }) => {
    const token = await getToken();
    const order = searchParams.get("order") === "asc" ? "ASC" : "DESC";
    const res = await fetch(
      `${API_URL}/feeds?order=${order}&limit=50&offset=${pageParam}`,
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
    getNextPageParam: (lastPage, pages) =>
      lastPage?.length === 50 ? pages.length * 50 : undefined,
    initialPageParam: 0,
  });

  const allFeedItems =
    data?.pages
      .filter((page): page is FeedItem[] => page !== null)
      .flat()
      .filter((item): item is FeedItem => item !== null) ?? [];

  const filterByTimeRange = (items: FeedItem[]) => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const isValidDate = (dateString?: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    return items.filter((item) => {
      const itemDate = isValidDate(
        item.publishedParsed || item.updatedParsed || item.createdAt,
      );
      if (!itemDate) return false;

      switch (currentTimeRange) {
        case "today":
          return itemDate >= startOfDay;
        case "week":
          return itemDate >= startOfWeek;
        case "month":
          return itemDate >= startOfMonth;
        case "year":
          return itemDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  const filterByLabelAndFeed = (items: FeedItem[]) => {
    if (currentLabel === "all") return items;
    const labelFiltered = items.filter(
      (item) => item.feed?.label === currentLabel,
    );
    return currentFeed === "all"
      ? labelFiltered
      : labelFiltered.filter((item) => item.feed?.title === currentFeed);
  };

  const filteredFeedItems = filterByTimeRange(
    filterByLabelAndFeed(allFeedItems),
  );
  const unreadItems = filteredFeedItems.filter((item) => !item.read);

  if (isPending) {
    return <FeedbackState type="loading" message="Loading feeds" />;
  }

  if (error) {
    return (
      <FeedbackState
        type="error"
        message={`Error loading feeds: ${error.message}`}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch p-3 md:p-4 lg:p-5">
      <FeedsPageHeader
        isFetchingNextPage={isFetchingNextPage}
        isPending={isPending}
        unreadItems={unreadItems}
        feedItems={allFeedItems}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-1">
        {allFeedItems.length > 0 ? (
          <>
            <FeedsLeftPanel feedItems={allFeedItems} />
            <FeedItems
              feedItems={filteredFeedItems}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </>
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
