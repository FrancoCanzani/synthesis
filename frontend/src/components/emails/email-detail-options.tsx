import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard } from "@/lib/helpers";
import { Email } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Mail,
  MoreHorizontal,
  Share,
  Star,
  Trash,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmailDetailOptions({ email }: { email: Email | null }) {
  const queryClient = useQueryClient();

  const readMutation = useMutation({
    mutationFn: (email: Email) =>
      updateEmailAttribute(email.id, email.recipientAlias, "read", !email.read),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailsData"] });
    },
    onError: () => {
      toast.error("Failed to mark email as read. Please try again.");
    },
  });

  const starMutation = useMutation({
    mutationFn: (email: Email) =>
      updateEmailAttribute(
        email.id,
        email.recipientAlias,
        "starred",
        !email.starred,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailsData"] });
    },
    onError: () => {
      toast.error("Failed to star email. Please try again.");
    },
  });

  async function updateEmailAttribute(
    id: number,
    recipientAlias: string,
    attribute: "read" | "starred",
    value: boolean,
  ) {
    const response = await fetch(`${API_URL}/emails`, {
      method: "PUT",
      body: JSON.stringify({
        id,
        recipient_alias: recipientAlias,
        attribute,
        value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update email ${attribute}`);
    }

    return response.json();
  }

  const handleShare = async (email: Email) => {
    const shareData = {
      title: email.subject,
      text: email.strippedText,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${email.subject}\n\n${email.strippedText}`,
        );
        toast.success("Copied to clipboard!");
      }
    } catch {
      toast.error("Failed to share content");
    }
  };

  if (!email) return null;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => {}}>
            <UserX className="mr-2 h-4 w-4" />
            <span>Unsubscribe</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyToClipboard(email.strippedText)}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy content</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare(email)}>
            <Share className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => starMutation.mutateAsync(email)}>
            <Star
              className="mr-2 h-4 w-4"
              fill={email.starred ? "#fbbf24" : "none"}
              stroke={email.starred ? "#fbbf24" : "currentColor"}
            />
            <span>{email.starred ? "Unstar" : "Star"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => readMutation.mutateAsync(email)}
            disabled={email.read}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>Mark as unread</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
