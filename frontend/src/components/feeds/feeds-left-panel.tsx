import { FeedItem } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

const timeRanges = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

export default function FeedsLeftPanel({
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
    setSearchParams({
      timeRange: currentTimeRange,
      label: label,
      feed: "all",
    });
  };

  const toggleExpandedLabel = (label: string) => {
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
    <div className="hidden w-1/3 overflow-y-auto py-2 pr-2 text-sm md:block">
      <div className="mb-6">
        <h3 className="mb-2 font-medium">Time Range</h3>
        <ul className="space-y-1">
          {timeRanges.map((range) => (
            <li key={range.value}>
              <button
                onClick={() => handleTimeRangeChange(range.value)}
                className={`block h-8 w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
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
        <ul className="space-y-1">
          <li>
            <button
              onClick={handleAllLabelsClick}
              className={`block h-8 w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
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
              <div className="flex cursor-pointer items-center px-2 py-1">
                <button onClick={() => toggleExpandedLabel(label)}>
                  {expandedLabels.includes(label) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                <button
                  onClick={() => toggleLabel(label)}
                  className={`ml-1 block h-8 w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
                    currentLabel === label && "bg-accent font-medium"
                  }`}
                >
                  {label}
                </button>
              </div>
              {expandedLabels.includes(label) && (
                <ul className="ml-4">
                  {getUniqueFeedsByLabel(label).map((feed) => {
                    if (!feed?.title) return null;
                    return (
                      <li key={feed.title}>
                        <button
                          onClick={() => handleFeedChange(feed.title, label)}
                          className={`block h-8 w-full rounded-sm px-2 py-1 text-left hover:bg-accent ${
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
    </div>
  );
}
