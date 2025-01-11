import AddFeedDialog from "@/components/add-feed-dialog";
import { FeedList } from "@/components/feed-list";
import ActionButton from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/helpers";
import { FeedItem } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isPending,
    error,
    data: feedItems,
  } = useQuery({
    queryKey: ["feeds"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/feeds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feeds");
      return response.json() as Promise<FeedItem[]>;
    },
  });

  async function markAllAsRead() {
    const token = await getToken();

    const response = await fetch(`${API_URL}/feeds/mark-all-read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to mark all posts as read");
    }

    return await response.json();
  }

  const mutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      toast.success("All posts marked as read.");
    },
    onError: () => {
      toast.error("Failed to mark all as read. Please try again.");
    },
  });

  const unread = feedItems?.filter((item) => item.read == false);

  if (isPending) return <div className="p-4">Loading feeds...</div>;
  if (error)
    return <div className="p-4">Error loading feeds: {error.message}</div>;

  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col p-2 md:p-4">
      <header className="bg-background p-2 md:p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold sm:text-2xl md:text-3xl">
              Feeds
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search feeds..."
              className="h-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ActionButton
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !unread || unread.length === 0}
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
        <FeedList feedItems={feedItems || []} />
      </div>
    </div>
  );
}
