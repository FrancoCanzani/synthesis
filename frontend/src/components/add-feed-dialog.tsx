import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getToken } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddFeedDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFeed = async () => {
    setIsLoading(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/feeds?url=${encodeURIComponent(urlInput)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add feed");
      }

      const data = await response.json();

      console.log(data);

      toast.success(
        `Feed "${data.feed.title}" added with ${data.items_count} items`,
      );
      setIsOpen(false);
      setUrlInput("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Please enter a valid URL");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add feed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        setUrlInput("");
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 hover:bg-accent/50",
                isOpen && "bg-accent/50",
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add feed</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Add feed</span>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="mx-auto flex w-full max-w-md flex-col gap-y-4 px-4 pb-4 pt-4 text-sm sm:max-w-[550px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Add a New Feed</h2>
          <p className="text-sm text-muted-foreground">
            Supports Atom, RSS, and JSON feeds.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              <strong>Atom/RSS:</strong> Look for RSS icon or "Subscribe" link
              on blogs
            </li>
            <li>
              <strong>Medium:</strong> Add "/feed" to the profile or publication
              URL
            </li>
            <li>
              <strong>Substack:</strong> Add "/feed" to the newsletter's URL
            </li>
            <li>
              <strong>JSON:</strong> Some modern platforms offer JSON feeds
              alongside RSS
            </li>
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feed-url" className="text-sm font-medium">
            Feed URL
          </Label>
          <div className="flex items-start justify-between space-x-1.5">
            <Input
              id="feed-url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter feed URL"
              className="w-3/4"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleAddFeed();
                }
              }}
            />
            <Button
              variant="outline"
              onClick={handleAddFeed}
              disabled={isLoading || !urlInput}
              className="w-1/4 bg-black text-white hover:bg-black/85 hover:text-white"
            >
              {isLoading ? "Adding..." : "Add Feed"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
