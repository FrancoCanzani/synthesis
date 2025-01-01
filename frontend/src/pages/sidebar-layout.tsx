import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useNotesStore } from "@/lib/store/use-notes-store";
import { useEffect } from "react";
import { Outlet } from "react-router";

export default function SidebarLayout() {
  const { user, loading } = useAuth();
  const { fetchNotes } = useNotesStore();

  useEffect(() => {
    if (user && !loading) {
      fetchNotes(user.id);
    }
  }, [user, loading, fetchNotes]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-w-0 bg-background">
        <AppSidebar />
        <div className="flex h-screen min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
