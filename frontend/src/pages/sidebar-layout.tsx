import MobileFooterMenu from "@/components/mobile-footer-menu";
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
        <main className="min-h-screen flex-1 flex-col justify-between">
          <Outlet />
          <MobileFooterMenu />
        </main>
      </div>
    </SidebarProvider>
  );
}
