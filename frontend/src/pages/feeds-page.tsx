import AddFeedDialog from "@/components/add-feed-dialog";
import { FeedList } from "@/components/feed-list";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getToken } from "@/lib/helpers";
import { Feed } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isPending,
    error,
    data: feeds,
  } = useQuery({
    queryKey: ["feeds"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/feeds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feeds");
      return response.json() as Promise<Feed[]>;
    },
  });

  const deleteFeedMutation = useMutation({
    mutationFn: async (feedUrl: string) => {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/feeds?url=${encodeURIComponent(feedUrl)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to delete feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      toast.success("Feed deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete feed");
    },
  });

  const filteredFeeds = feeds?.filter(
    (feed) =>
      feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feed.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isPending) return <div className="p-4">Loading feeds...</div>;
  if (error)
    return <div className="p-4">Error loading feeds: {error.message}</div>;

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <h2 className="font-medium">Feeds</h2>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search feeds..."
              className="h-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <AddFeedDialog />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <FeedList
          feeds={filteredFeeds || []}
          onDeleteFeed={(url) => deleteFeedMutation.mutate(url)}
        />
      </div>
    </div>
  );
}
