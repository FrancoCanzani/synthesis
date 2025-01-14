import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type FeedbackStateProps = {
  type: "empty" | "loading" | "error";
  message?: string;
  action?: ReactNode;
  className?: string;
};

export default function FeedbackState({
  type,
  message,
  action,
  className,
}: FeedbackStateProps) {
  const defaultMessages = {
    empty: "No items found",
    loading: "Loading...",
    error: "Something went wrong",
  };

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[200px] max-w-4xl flex-col items-center justify-center gap-4 p-4 text-center text-muted-foreground",
        className,
      )}
    >
      <p>{message || defaultMessages[type]}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
