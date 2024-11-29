import { Outlet } from 'react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className='flex bg-red-700 h-screen bg-background'>
        <Sidebar />
        <main className='flex-1 overflow-auto p-4'>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
