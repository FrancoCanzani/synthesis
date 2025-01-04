import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function AddFeedDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleAddFeed = () => {
    toast.success("Feed added successfully via URL");
    setIsOpen(false);
    setUrlInput("");
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
            />
            <Button
              variant={"outline"}
              onClick={handleAddFeed}
              className="w-1/4 bg-black text-white hover:bg-black/85 hover:text-white"
            >
              Add Feed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
