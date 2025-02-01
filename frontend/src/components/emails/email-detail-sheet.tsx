import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Email } from "@/lib/types";

export function EmailDetailSheet({
  email,
  children,
}: {
  email: Email | null;
  children: React.ReactNode;
}) {
  if (!email) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="max-h-[85%] overflow-y-auto" side="bottom">
        <SheetHeader>
          <SheetTitle className="text-left">{email.subject}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">From:</span>
              <span className="font-medium">
                {email.fromName || email.sender}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To:</span>
              <span className="font-medium">{email.recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {new Date(email.timestamp * 1000).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t py-4">
            {email.strippedHTML ? (
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: email.strippedHTML }}
              />
            ) : (
              <div className="whitespace-pre-wrap">{email.bodyPlain}</div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
