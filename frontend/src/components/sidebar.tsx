import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { Suspense } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { signOut } from '@/lib/helpers';
import SidebarNotes from './sidebar-notes';
import { Link } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '#',
    icon: Home,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
  },
  {
    title: 'Calendar',
    url: '#',
    icon: Calendar,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
  },
];

export function AppSidebar() {
  const newNoteId = uuidv4();

  return (
    <Sidebar>
      <SidebarContent className='rounded-r-md'>
        <SidebarGroup>
          <SidebarGroupLabel>Synthetic</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='flex-col justify-between h-full'>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className='flex items-center justify-between w-full'>
              Notes
              <Link className='hover:underline' to={`/notes/${newNoteId}`}>
                New
              </Link>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='flex-col justify-between h-full'>
              <Suspense fallback={<div>Loading...</div>}>
                <SidebarNotes />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className='flex items-center justify-start space-x-4'>
          <ThemeToggle />
          <button className='text-start' onClick={async () => await signOut()}>
            Sign out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
