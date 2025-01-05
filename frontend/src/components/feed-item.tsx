import { FeedItem as FeedItemType } from "@/lib/types";
import { formatDistanceToNowStrict } from "date-fns";

interface FeedItemProps {
  item: FeedItemType;
}

export function FeedItem({ item }: FeedItemProps) {
  const parsedDate = item.published
    ? new Date(item.published)
    : item.published_parsed
      ? new Date(item.published_parsed)
      : null;

  // Format the date if valid
  const formattedDate =
    parsedDate && !isNaN(parsedDate.getTime())
      ? formatDistanceToNowStrict(parsedDate)
      : "Unknown Date";

  return (
    <div className={`px-4 py-2 pl-8 ${item.read ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
        >
          {item.title}
        </a>
        <div className="flex items-center gap-2 text-xs">
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
