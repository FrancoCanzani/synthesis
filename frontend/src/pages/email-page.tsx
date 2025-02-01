import ActionButton from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard, generateEmailAlias } from "@/lib/helpers";
import { useAuth } from "@/lib/hooks/use-auth";
import supabase from "@/lib/supabase";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmailPage() {
  const { user } = useAuth();

  console.log(user);

  const userEmailAlias = user?.user_metadata.app_email_alias;

  async function handleCreateEmailAlias() {
    try {
      if (user) {
        const alias = generateEmailAlias();

        const { data, error } = await supabase.auth.updateUser({
          data: { app_email_alias: alias },
        });

        if (error) {
          toast.error("Error creating email alias");
          console.log(error);
          return;
        }

        if (data) {
          window.location.reload();
        }
      }
    } catch {
      toast.error("Error creating email alias");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch p-3 md:p-4 lg:p-5">
      <header className="mb-8 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">Inbox</h2>
        </div>
        <div className="flex items-center gap-2">
          {userEmailAlias && (
            <ActionButton
              tooltipContent={`${userEmailAlias}@shamva.app`}
              onClick={async () => {
                await copyToClipboard(userEmailAlias + "@shamva.app");
                toast.success("Email alias copied to clipboard");
              }}
            >
              @
            </ActionButton>
          )}
          <Label className="sr-only">Search emails</Label>
          <Input
            placeholder="Search articles..."
            //   value={query}
            //   onChange={(e) => setSearchParams({ q: e.target.value })}
            className="hidden h-8 w-64 sm:block"
          />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1">
        {userEmailAlias ? (
          <div>Something with email</div>
        ) : (
          <div className="flex max-w-4xl flex-col items-start justify-center gap-4 p-4">
            <p className="text-muted-foreground">
              You need to set up an email address to use this feature. Please
              generate your unique email alias to start subscribing to your
              favourite content.
            </p>
            <button onClick={() => handleCreateEmailAlias()}>
              Generate alias
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
