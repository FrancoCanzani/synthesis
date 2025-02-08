import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getToken } from "@/lib/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "../ui/input";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddFeedDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const handleAddFeed = async () => {
    setIsLoading(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/feeds?feedLink=${encodeURIComponent(urlInput)}&label=${encodeURIComponent(labelInput)}`,
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
        toast.error(errorData.error || "Failed to add feed");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["feedItems"] });
      toast.success("Feed added successfully");
      setIsOpen(false);
      setUrlInput("");
      setLabelInput("");
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
        setLabelInput("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add Feed
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-auto flex w-full max-w-md flex-col gap-y-4 px-4 pb-4 pt-4 text-sm sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add new feed</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter feed URL"
                className="h-9 w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleAddFeed();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="Add a label (optional)"
              className="h-9 flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleAddFeed}
              disabled={isLoading || !urlInput}
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
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
      </DialogContent>
    </Dialog>
  );
}
