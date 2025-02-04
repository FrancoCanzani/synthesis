import { Email } from "@/lib/types";
import EmailDetailOptions from "./email-detail-options";

export default function EmailDetail({ email }: { email: Email | null }) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Select an email to view its contents
      </div>
    );
  }

  return (
    <div className="hidden max-h-[82vh] w-2/3 overflow-y-scroll md:block">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{email.subject}</h1>
        <EmailDetailOptions email={email} />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold">{email.fromName}</p>
        </div>
        <p className="text-sm text-gray-500">
          {new Date(email.timestamp * 1000).toLocaleString()}
        </p>
      </div>
      <div
        className="prose max-w-none border-t py-4 text-sm dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: email.strippedHTML }}
      />
    </div>
  );
}
