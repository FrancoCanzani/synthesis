import FeedbackState from "@/components/feedback-state";
import AddFeedDialog from "@/components/feeds/add-feed-dialog";
import FeedList from "@/components/feeds/feed-list";
import ActionButton from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/helpers";
import { FeedItem } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { CalendarArrowDown, CalendarArrowUp, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams({ order: "" });

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

  const mutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedItems"] });
      toast.success("All posts marked as read.");
    },
    onError: () => {
      toast.error("Failed to mark all as read. Please try again.");
    },
  });

  const handleOrderChange = () => {
    const order = searchParams.get("order");
    const newOrder = order === "asc" ? "desc" : "asc";
    setSearchParams({ order: newOrder });
    queryClient.invalidateQueries({ queryKey: ["feedItems", order] });
  };

  const feedItems: FeedItem[] =
    data?.pages
      .filter((page): page is FeedItem[] => page !== null)
      .flat()
      .filter((item): item is FeedItem => item !== null) ?? [];

  const unread = feedItems.filter((item) => item.read === false);

  if (isPending)
    return <FeedbackState type="loading" message="Loading feeds" />;
  if (error)
    return (
      <FeedbackState
        type="error"
        message={`Error loading feeds: ${error.message}`}
      />
    );

  async function markAllAsRead() {
    const token = await getToken();
    const response = await fetch(`${API_URL}/feeds/mark-all-read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to mark posts as read");
    }

    return await response.json();
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-1 flex-col items-stretch overflow-y-auto p-2 md:p-4">
      <header className="bg-background p-2 md:p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">
              Feeds
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Label className="sr-only">Search feeds</Label>
            <Input
              placeholder="Search feeds..."
              className="hidden h-8 w-64 sm:block"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ActionButton
              onClick={handleOrderChange}
              disabled={isPending || isFetchingNextPage}
              tooltipContent={
                searchParams.get("order") === "asc"
                  ? "Sort descending"
                  : "Sort ascending"
              }
            >
              {searchParams.get("order") === "asc" ? (
                <CalendarArrowDown className="h-4 w-4" />
              ) : (
                <CalendarArrowUp className="h-4 w-4" />
              )}
              <span className="sr-only">
                {searchParams.get("order") === "asc"
                  ? "Sort descending"
                  : "Sort ascending"}
              </span>
            </ActionButton>
            <ActionButton
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || unread.length === 0}
              tooltipContent={
                mutation.isPending ? "Marking..." : "Mark All as Read"
              }
            >
              <CheckCheck className="h-4 w-4" />
              <span className="sr-only">
                {mutation.isPending ? "Marking..." : "Mark all as read"}
              </span>
            </ActionButton>
            <AddFeedDialog />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1">
        {feedItems.length > 0 ? (
          <FeedList
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
