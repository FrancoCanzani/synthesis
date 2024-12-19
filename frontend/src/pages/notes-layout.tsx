import { Outlet } from 'react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';
import { useNotesStore } from '@/lib/store/use-note-store';
import { useAuth } from '@/lib/hooks/use-auth';

export default function NotesLayout() {
  const { user, loading } = useAuth();
  const { fetchNotes } = useNotesStore();

  useEffect(() => {
    if (user && !loading) {
      fetchNotes(user.id);
    }
  }, [user, loading, fetchNotes]);

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className='w-full flex bg-background min-w-0'>
          <AppSidebar />
          <div className='flex-1 flex flex-col min-w-0'>
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
