import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FeedItem } from "@/lib/types";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../ui/button";

const timeRanges = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

export default function FeedsLeftSheet({
  feedItems,
}: {
  feedItems: FeedItem[];
}) {
  const labels = Array.from(
    new Set(
      feedItems
        .map((item: FeedItem) => item.feed?.label)
        .filter((label): label is string => Boolean(label)),
    ),
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const currentTimeRange = searchParams.get("timeRange") || "today";
  const currentLabel = searchParams.get("label") || "all";
  const currentFeed = searchParams.get("feed") || "all";

  const [expandedLabels, setExpandedLabels] = useState<string[]>([]);

  const toggleLabel = (label: string) => {
    setExpandedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleTimeRangeChange = (value: string) => {
    setSearchParams({
      timeRange: value,
      label: currentLabel,
      feed: currentFeed,
    });
  };

  const handleFeedChange = (feedTitle: string | undefined, label: string) => {
    setSearchParams({
      timeRange: currentTimeRange,
      label: label,
      feed: feedTitle ?? "all", // Use "all" as default if feedTitle is undefined
    });
  };

  const handleAllLabelsClick = () => {
    setSearchParams({ timeRange: currentTimeRange, label: "all", feed: "all" });
  };

  const getUniqueFeedsByLabel = (targetLabel: string) => {
    const matchingFeeds = feedItems.filter(
      (item: FeedItem) => item.feed?.label === targetLabel,
    );

    const uniqueFeedsMap = new Map<string, FeedItem["feed"]>();

    matchingFeeds.forEach((item) => {
      if (item.feed?.title) {
        uniqueFeedsMap.set(item.feed.title, item.feed);
      }
    });

    const uniqueFeeds = Array.from(uniqueFeedsMap.values());
    return uniqueFeeds;
  };

  return (
    <Sheet>
      <SheetTrigger className="block md:hidden">
        <Button variant={"ghost"} size="icon" className="h-8 w-8">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side={"left"}
        className="w-2/3 overflow-y-auto py-2 pr-2 text-sm sm:w-1/3"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mb-6">
          <h3 className="mb-2 font-medium">Time Range</h3>
          <ul>
            {timeRanges.map((range) => (
              <li key={range.value}>
                <button
                  onClick={() => handleTimeRangeChange(range.value)}
                  className={`block w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
                    currentTimeRange === range.value && "bg-accent font-medium"
                  }`}
                >
                  {range.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Labels</h3>
          <ul>
            <li>
              <button
                onClick={handleAllLabelsClick}
                className={`block w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
                  currentLabel === "all" &&
                  currentFeed === "all" &&
                  "bg-accent font-medium"
                }`}
              >
                All
              </button>
            </li>
            {labels.map((label) => (
              <li key={label}>
                <div
                  className="flex cursor-pointer items-center px-2 py-1"
                  onClick={() => toggleLabel(label)}
                >
                  {expandedLabels.includes(label) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <span className="ml-1">{label}</span>
                </div>
                {expandedLabels.includes(label) && (
                  <ul className="ml-4">
                    {getUniqueFeedsByLabel(label).map((feed) => {
                      if (!feed?.title) return null;
                      return (
                        <li key={feed.title}>
                          <button
                            onClick={() => handleFeedChange(feed.title, label)}
                            className={`block w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
                              currentLabel === label &&
                              currentFeed === feed.title &&
                              "bg-accent font-medium"
                            }`}
                          >
                            {feed.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
