import AddFeedDialog from "@/components/feeds/add-feed-dialog";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/helpers";
import { FeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarArrowDown,
  CalendarArrowUp,
  CheckCheck,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedsPageHeader({
  isPending,
  isFetchingNextPage,
  unreadItems,
}: {
  isPending: boolean;
  isFetchingNextPage: boolean;
  unreadItems: FeedItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams({
    order: "desc",
    view: "row",
  });

  const view = searchParams.get("view") || "row";

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

    setSearchParams((params) => {
      params.set("order", newOrder);
      return params;
    });

    queryClient.invalidateQueries({ queryKey: ["feedItems", order] });
  };

  const setView = (newView: string) => {
    setSearchParams((prev) => {
      prev.set("view", newView);
      return prev;
    });
  };

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
    <header className="mb-8 flex w-full items-center justify-between">
      <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">Feeds</h2>
      <div className="flex items-center gap-2">
        <Label className="sr-only">Search feeds</Label>
        <Input
          placeholder="Search feeds..."
          className="hidden h-8 w-64 sm:block"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div
          className={cn(
            "flex items-center gap-2 border-r pr-2 sm:border-x sm:px-2",
          )}
        >
          <Button
            variant={view === "row" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("row")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
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
          disabled={mutation.isPending || unreadItems.length === 0}
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
    </header>
  );
}
