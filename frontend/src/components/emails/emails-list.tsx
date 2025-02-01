import { useIsMobile } from "@/lib/hooks/use-mobile";
import { Email } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router";
import { Separator } from "../ui/separator";
import EmailDetail from "./email-detail";
import { EmailDetailSheet } from "./email-detail-sheet";

export default function EmailList({ emails }: { emails: Email[] }) {
  const isMobile = useIsMobile();

  const [searchParams, setSearchParams] = useSearchParams({
    emailId: emails[0]?.id.toFixed() || "",
  });

  const selectedEmailId = searchParams.get("emailId");

  const selectedEmail = emails.find(
    (email) => email.id.toFixed() === selectedEmailId,
  );

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
            <EmailDetailSheet key={email.id} email={email}>
              <li
                className="cursor-pointer space-y-1 p-3 hover:bg-accent md:p-4 lg:p-5"
                onClick={() => setSearchParams({ emailId: email.id.toFixed() })}
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
              )}
              onClick={() => setSearchParams({ emailId: email.id.toFixed() })}
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
              <div className="text-sm">{email.subject}</div>
              <div className="truncate text-xs text-gray-500">
                {email.strippedText}
              </div>
            </li>
          ),
        )}
      </ol>
      {!isMobile && (
        <>
          <Separator orientation="vertical" />
          {selectedEmail ? (
            <EmailDetail email={selectedEmail} />
          ) : (
            <EmailDetail email={null} />
          )}
        </>
      )}
    </div>
  );
}
