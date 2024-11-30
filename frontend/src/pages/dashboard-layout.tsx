import Editor from '@/components/editor';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar';

const DashboardLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className='w-full flex bg-background'>
        <AppSidebar />
        <div className='flex-1 flex flex-col p-4 lg:p-6'>
          <div className='border rounded-md pt-1.5 mb-3 min-h-full'>
            <header className='border-b flex items-center px-4 py-1.5 bg-background'>
              <SidebarTrigger />
            </header>
            <main className='flex-1'>
              <div className='mx-auto pb-4'>
                <Editor />
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
