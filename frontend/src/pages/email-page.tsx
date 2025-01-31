import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmailPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-stretch p-3 md:p-4 lg:p-5">
      <header className="mb-8 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">Inbox</h2>
        </div>
        <div className="flex items-center gap-2">
          <Label className="sr-only">Search emails</Label>
          <Input
            placeholder="Search articles..."
            //   value={query}
            //   onChange={(e) => setSearchParams({ q: e.target.value })}
            className="hidden h-8 w-64 sm:block"
          />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1">emails...</main>
    </div>
  );
}
