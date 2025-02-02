import { useIsMobile } from "@/lib/hooks/use-mobile";
import { Email } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import EmailDetail from "./email-detail";
import { EmailDetailSheet } from "./email-detail-sheet";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmailList({ emails }: { emails: Email[] }) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams({
    emailId: emails[0]?.id.toFixed() || "",
  });

  const selectedEmailId = searchParams.get("emailId");

  const selectedEmail = emails.find(
    (email) => email.id.toFixed() === selectedEmailId,
  );

  const readMutation = useMutation({
    mutationFn: handleReadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailsData"] });
    },
    onError: () => {
      toast.error("Failed to mark email as read. Please try again.");
    },
  });

  async function handleReadStatus(email: Email) {
    const response = await fetch(`${API_URL}/emails`, {
      method: "PUT",
      body: JSON.stringify({
        id: email.id,
        recipient_alias: email.recipientAlias,
        attribute: "read",
        value: !email.read,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark posts as read");
    }

    return await response.json();
  }

  return (
    <div
      className={cn(
        "h-full w-full",
        !isMobile &&
          "flex items-start justify-between space-x-2 p-3 md:p-4 lg:p-5",
      )}
    >
      <ol
        className={cn(
          "divide-y",
          !isMobile && "flex w-1/3 flex-col items-start justify-start",
        )}
      >
        {emails.map((email) =>
          isMobile ? (
            <EmailDetailSheet
              key={email.id}
              email={email}
              onOpenChange={async () => {
                if (!email.read) {
                  await readMutation.mutateAsync(email);
                }
                setSearchParams({ emailId: email.id.toFixed() });
              }}
            >
              <li
                className={cn(
                  "w-full cursor-pointer space-y-1 p-3 hover:bg-accent",
                  email.read && "opacity-60",
                  !email.read && "border-l-4 border-l-blue-500",
                )}
                onClick={() => {
                  setSearchParams({ emailId: email.id.toFixed() });
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {email.fromName.split("<")[0]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(email.timestamp * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-sm font-medium">{email.subject}</div>
                <div className="truncate text-xs text-gray-500">
                  {email.strippedText}
                </div>
              </li>
            </EmailDetailSheet>
          ) : (
            <li
              key={email.id}
              className={cn(
                "w-full cursor-pointer space-y-1 p-3 hover:bg-accent",
                selectedEmailId === email.id.toFixed() && "bg-accent",
                email.read && "opacity-60",
                !email.read && "border-l-2 border-l-blue-500",
              )}
              onClick={() => {
                if (!email.read) {
                  readMutation.mutate(email);
                }
                setSearchParams({ emailId: email.id.toFixed() });
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start space-x-2">
                  <span className="font-medium">
                    {email.fromName.split("<")[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(email.timestamp * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm">{email.subject}</div>
              <div className="truncate text-xs text-gray-500">
                {email.strippedText}
              </div>
            </li>
          ),
        )}
      </ol>

      <Separator orientation="vertical" className="hidden md:block" />
      {selectedEmail ? (
        <EmailDetail email={selectedEmail} />
      ) : (
        <EmailDetail email={null} />
      )}
    </div>
  );
}
