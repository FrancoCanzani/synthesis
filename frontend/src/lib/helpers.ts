import supabase from './supabase';

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
