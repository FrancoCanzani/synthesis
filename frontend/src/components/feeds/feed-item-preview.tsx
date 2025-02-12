import UnsubscribeFeedDialog from "@/components/feeds/unsubscribe-feed-dialog";
import ActionButton from "@/components/ui/action-button";
import { FeedItem } from "@/lib/types";
import { Check, Copy, Star, X } from "lucide-react";

export default function FeedItemPreview({
  feedItem,
}: {
  feedItem: FeedItem | null;
}) {
  if (!feedItem) {
    return <div>Some</div>;
  }

  return (
    <>
      <div className="w-full overflow-y-scroll p-3 text-sm">
        <div className="space-y-4">
          <h4 className="text-xl font-bold">{feedItem?.title}</h4>
          <h6 className="max-w-full truncate text-sm">{feedItem.feed.title}</h6>
          <a
            href={feedItem.link || "#"}
            target="_blank"
            className="inline-block w-full rounded-sm bg-accent p-2 text-center font-medium no-underline hover:bg-accent/50"
            rel="noopener noreferrer"
          >
            Read full article
          </a>
        </div>

        <div className="space-y-4">
          {feedItem.imageUrl && (
            <img
              src={feedItem.imageUrl}
              alt={feedItem.title}
              className="w-full rounded-sm object-cover"
            />
          )}
          <article className="prose prose-sm dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{ __html: feedItem.description || "" }}
            />
            <div dangerouslySetInnerHTML={{ __html: feedItem.content || "" }} />
          </article>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-between gap-x-1.5 border-t p-2">
        <UnsubscribeFeedDialog
          feedLink={feedItem.feedLink}
          feedTitle={feedItem.feed.title}
        />
        <div className="flex w-full items-center justify-end gap-x-1.5">
          <ActionButton
            tooltipContent={feedItem.starred ? "Unstar" : "Star"}
            // onClick={async () =>
            //   // await updatePostState(item.id, "starred", !item.starred)
            // }
          >
            <Star
              className="h-4 w-4"
              fill={feedItem.starred ? "#fbbf24" : "none"}
              stroke={feedItem.starred ? "#fbbf24" : "currentColor"}
            />
          </ActionButton>
          <ActionButton
            tooltipContent={feedItem.read ? "Mark as unread" : "Mark as read"}
            // onClick={async () =>
            //   // await updatePostState(item.id, "read", !item.read)
            // }
          >
            {feedItem.read ? (
              <X className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </ActionButton>
          {feedItem.link && (
            <ActionButton
              tooltipContent="Copy link"
              // onClick={async () => {
              //   if (item.link) {
              //     try {
              //       await copyToClipboard(item.link);
              //       toast.success("Link copied to clipboard");
              //     } catch {
              //       toast.error("Error copying link");
              //     }
              //   }
              // }}
            >
              <Copy className="h-4 w-4" />
            </ActionButton>
          )}
        </div>
      </div>
    </>
  );
}
