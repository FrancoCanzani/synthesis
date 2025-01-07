import { copyToClipboard, getToken } from "@/lib/helpers";
import { FeedItem as FeedItemType } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Check, Copy, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const API_URL = import.meta.env.VITE_API_URL;

interface FeedItemProps {
  item: FeedItemType;
}

async function updatePostState(
  link: string,
  attribute: string,
  value: boolean,
) {
  const token = await getToken();
  const response = await fetch(`${API_URL}/feeds`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ attribute, value, link }),
  });

  if (!response.ok) {
    toast.error("Failed to update post state");
  }

  return await response.json();
}

export function FeedItem({ item }: FeedItemProps) {
  console.log(item);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      attribute,
      value,
      link,
    }: {
      attribute: string;
      value: boolean;
      link: string;
    }) => updatePostState(link, attribute, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
    onError: () => {
      toast.error("Failed to update post. Please try again.");
    },
  });

  const parsedDate = item.published
    ? new Date(item.published)
    : item.published_parsed
      ? new Date(item.published_parsed)
      : null;

  const formattedDate =
    parsedDate && !isNaN(parsedDate.getTime())
      ? formatDistanceToNowStrict(parsedDate)
      : "Unknown Date";

  return (
    <div
      className={`group/item w-full px-4 py-1 pl-8 hover:bg-muted/25 ${item.read ? "opacity-60" : ""}`}
    >
      <div className="flex w-full items-center justify-between">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-4/6 truncate text-sm font-medium hover:underline"
        >
          {item.title}
        </a>
        <div className="flex w-2/6 items-center justify-end gap-x-1.5 text-xs">
          <div className="opacity-0 transition-opacity duration-200 group-hover/item:opacity-100">
            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-8 w-8"
              onClick={() =>
                mutation.mutate({
                  link: item.link,
                  attribute: "read",
                  value: !item.read,
                })
              }
            >
              {item.read ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="sr-only">
                {item.read ? "Mark as unread" : "Mark as read"}
              </span>
            </Button>

            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-8 w-8"
              onClick={() =>
                mutation.mutate({
                  link: item.link,
                  attribute: "starred",
                  value: !item.starred,
                })
              }
            >
              {item.starred ? (
                <Star className="h-4 w-4" fill="#fcdf03" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              <span className="sr-only">
                {item.starred ? "Unstar" : "Star"}
              </span>
            </Button>

            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-8 w-8"
              onClick={async () => {
                await copyToClipboard(item.link);
                toast.success("URL copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <span className="px-3">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
