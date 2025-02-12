type SidebarProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SIDEBAR_WIDTH = "20rem";

export function RightSidebar({ children, open, onOpenChange }: SidebarProps) {
  return (
    <div
      className={`inset-y-0 z-10 hidden h-svh w-0 translate-x-full border-l bg-background transition-transform duration-200 ease-in-out md:block md:w-[--sidebar-width] md:translate-x-0`}
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
