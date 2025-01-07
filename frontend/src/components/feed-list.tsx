import { Button } from "@/components/ui/button";
import { Feed } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { FeedItem } from "./feed-item";

interface FeedListProps {
  feeds: Feed[];
  onDeleteFeed: (url: string) => void;
}

export function FeedList({ feeds, onDeleteFeed }: FeedListProps) {
  const [expandedFeeds, setExpandedFeeds] = useState<string[]>([]);

  const toggleFeed = (feedLink: string) => {
    setExpandedFeeds((prev) =>
      prev.includes(feedLink)
        ? prev.filter((link) => link !== feedLink)
        : [...prev, feedLink],
    );
  };

  const getUnreadCount = (items: Feed["items"]) => {
    return items.filter((item) => !item.read).length;
  };

  return (
    <div className="divide-y border-b">
      {feeds.map((feed) => (
        <div key={feed.link} className="group">
          <div
            className={cn(
              "flex cursor-pointer items-center justify-between p-2 hover:bg-accent/50",
              expandedFeeds.includes(feed.link) && "bg-accent/50",
            )}
            onClick={() => toggleFeed(feed.link)}
          >
            <div className="flex items-center gap-2">
              {expandedFeeds.includes(feed.link) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <h3 className="text-sm font-medium">{feed.title}</h3>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {feed.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-x-1.5">
              <span className="text-xs font-medium">
                {getUnreadCount(feed.items)} unread
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFeed(feed.link);
                }}
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {expandedFeeds.includes(feed.link) && (
            <div className="divide-y border-t bg-muted/50">
              {feed.items.map((item) => (
                <FeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
