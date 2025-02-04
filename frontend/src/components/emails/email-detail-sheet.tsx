import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Email } from "@/lib/types";
import EmailDetailOptions from "./email-detail-options";

export function EmailDetailSheet({
  email,
  children,
  onOpenChange,
}: {
  email: Email | null;
  children: React.ReactNode;
  onOpenChange: () => void;
}) {
  if (!email) return null;

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange();
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="max-h-[85%] overflow-y-auto" side="bottom">
        <SheetHeader>
          <SheetTitle className="text-left">{email.subject}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-start space-x-1">
              <span className="text-muted-foreground">From:</span>
              <span className="truncate font-medium">
                {email.fromName || email.sender}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-1">
              <div className="flex items-center justify-start space-x-1">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {new Date(email.timestamp * 1000).toLocaleString()}
                </span>
              </div>
              <EmailDetailOptions email={email} />
            </div>
          </div>

          <div className="border-t py-4">
            {email.strippedHTML ? (
              <div
                className="prose max-w-none text-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: email.strippedHTML }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm">
                {email.bodyPlain}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
