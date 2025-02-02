import { Email } from "@/lib/types";

export default function EmailDetail({ email }: { email: Email | null }) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Select an email to view its contents
      </div>
    );
  }

  return (
    <div className="hidden max-h-[82vh] w-2/3 overflow-y-scroll p-2 md:block">
      <h1 className="mb-4 text-2xl font-semibold">{email.subject}</h1>
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
