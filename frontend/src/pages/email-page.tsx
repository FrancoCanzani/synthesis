import EmailList from "@/components/emails/emails-list";
import ActionButton from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard, generateEmailAlias } from "@/lib/helpers";
import { useAuth } from "@/lib/hooks/use-auth";
import supabase from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmailPage() {
  const { user } = useAuth();
  const userEmailAlias = user?.user_metadata.app_email_alias;
  const queryClient = useQueryClient();

  const {
    isPending,
    error: queryError,
    data,
    isFetching,
  } = useQuery({
    queryKey: ["emailsData", userEmailAlias],
    queryFn: async () => {
      if (!userEmailAlias) return null;
      const response = await fetch(`${API_URL}/emails?alias=${userEmailAlias}`);
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }
      return response.json();
    },
    refetchInterval: 300 * 1000, // Refetch every 5 minutes
  });

  async function handleCreateEmailAlias() {
    try {
      if (user) {
        const alias = generateEmailAlias();
        const { data, error } = await supabase.auth.updateUser({
          data: { app_email_alias: alias },
        });

        if (error) {
          toast.error("Error creating email alias");
          console.error(error);
          return;
        }

        if (data) {
          toast.success("Email alias created successfully");
          window.location.reload();
        }
      }
    } catch (err) {
      toast.error("Error creating email alias");
      console.error(err);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch">
      <header className="flex w-full items-center justify-between p-3 md:p-4 lg:p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">Inbox</h2>
        </div>
        <div className="flex items-center gap-2">
          {userEmailAlias && (
            <ActionButton
              tooltipContent={`${userEmailAlias}@email.shamva.app`}
              onClick={async () => {
                await copyToClipboard(userEmailAlias + "@email.shamva.app");
                toast.success("Email alias copied to clipboard");
              }}
            >
              <AtSign className="h-4 w-4" />
            </ActionButton>
          )}
          {userEmailAlias && (
            <ActionButton
              tooltipContent="Refreh emails"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["emailsData"] })
              }
              disabled={isFetching || isPending}
            >
              <RefreshCcw
                className={cn(
                  "h-4 w-4",
                  isFetching || isPending ? "animate-spin" : "",
                )}
              />
            </ActionButton>
          )}
          <Label className="sr-only">Search emails</Label>
          <Input
            placeholder="Search emails..."
            className="hidden h-8 w-64 sm:block"
          />
        </div>
      </header>
      <main className="h-full">
        {userEmailAlias ? (
          <>
            {isPending || isFetching ? (
              <div className="flex items-center justify-center p-4">
                <p>Loading emails...</p>
              </div>
            ) : queryError ? (
              <div className="flex items-center justify-center p-4">
                <p className="text-red-500">
                  Error: {queryError.message || "Failed to fetch emails"}
                </p>
              </div>
            ) : data ? (
              <EmailList emails={data} />
            ) : (
              <div className="flex items-center justify-center p-4">
                <p>No emails found.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex max-w-4xl flex-col items-start justify-center gap-4 p-4">
            <p className="text-muted-foreground">
              You need to set up an email address to use this feature. Please
              generate your unique email alias to start subscribing to your
              favourite content.
            </p>
            <button
              onClick={handleCreateEmailAlias}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Generate alias
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
