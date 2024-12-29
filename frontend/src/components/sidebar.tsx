import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { Suspense } from 'react';
import {
  Sidebar,
  SidebarHeader,
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
import { useAuth } from '@/lib/hooks/use-auth';

const items = [
  {
    title: 'Home',
    url: '/notes',
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

  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        {user ? (
          <div className='flex w-full pt-4 pl-2 items-center justify-start space-x-4'>
            <div className='bg-black flex items-center justify-center rounded-md text-white text-xl font-medium p-3 w-8 h-8 text-center'>
              {user.user_metadata.name.split(' ')[0][0]}
            </div>
            <p className='capitalize font-medium'>
              {user.user_metadata.name.split(' ')[0]}'s notes
            </p>
          </div>
        ) : (
          'Loading...'
        )}
      </SidebarHeader>
      <SidebarContent className='rounded-r-md'>
        <SidebarGroup>
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
              Write
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
      <SidebarFooter className='flex flex-row items-center justify-between space-x-4 pb-4'>
        <ThemeToggle />
        <button
          className='text-sm px-2 py-1 text-start hover:bg-accent rounded-md font-medium'
          onClick={async () => await signOut()}
        >
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
