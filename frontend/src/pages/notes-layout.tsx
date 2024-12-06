import { Outlet } from 'react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';
import { useNotesStore } from '@/lib/store/use-note-store';

export default function NotesLayout() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className='w-full flex bg-background'>
          <AppSidebar />
          <div className='flex-1 flex flex-col p-4 lg:p-6'>
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
