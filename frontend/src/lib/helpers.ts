import { toast } from "sonner";
import supabase from "./supabase";

export async function signOut() {
  await supabase.auth.signOut();
}

export const fetcher = async <T>(
  ...args: Parameters<typeof fetch>
): Promise<T> => {
  const response = await fetch(...args);

  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    }
  } catch {
    toast.error("Failed to copy to clipboard");
  }
}

export function formatTextBeforeInsertion(text: string) {
  const map = text
    .split("\n")
    .filter((chunk) => chunk !== "")
    .map((chunk) => `<p>${chunk}</p>`)
    .join("");

  return map;
}

export const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
