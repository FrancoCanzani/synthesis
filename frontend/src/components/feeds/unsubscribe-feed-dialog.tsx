import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getToken } from "@/lib/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface UnsubscribeFeedDialogProps {
  feedLink?: string;
  feedTitle?: string;
}

export default function UnsubscribeFeedDialog({
  feedLink,
  feedTitle,
}: UnsubscribeFeedDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const handleUnsubscribeFeed = async () => {
    if (!feedLink) {
      toast.error("Invalid feed link");
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/feeds?feedLink=${encodeURIComponent(feedLink)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        toast.error("Failed to unsubscribe from feed");
      }

      queryClient.invalidateQueries({ queryKey: ["feedItems"] });

      toast.success(`Successfully unsubscribed from feed`);
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to unsubscribe from feed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!feedLink || !feedTitle) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="h-8 hover:bg-accent/50">
          Unsubscribe
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unsubscribe from Feed</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {`Are you sure you want to unsubscribe from the feed: ${feedTitle}. This feed and all it's related posts will be deleted.`}
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size={"sm"}
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size={"sm"}
                onClick={handleUnsubscribeFeed}
                disabled={isLoading}
              >
                Unsubscribe
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
