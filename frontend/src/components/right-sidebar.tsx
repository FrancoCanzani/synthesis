import { useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import { useIsMobile } from '@/lib/hooks/use-mobile';

type SidebarProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SIDEBAR_WIDTH = '20rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';

export function RightSidebar({ children, open, onOpenChange }: SidebarProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, onOpenChange]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side='right'
          className='w-[--sidebar-width] p-0'
          style={
            { '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties
          }
        >
          <div className='flex h-full w-full flex-col'>{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={`inset-y-0 z-10 h-svh border-l bg-background transition-transform duration-200 ease-in-out ${
        open
          ? 'translate-x-0 w-[--sidebar-width]'
          : 'translate-x-full w-0 hidden'
      }`}
      style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
