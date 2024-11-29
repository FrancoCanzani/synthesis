import {
  Home,
  Clock,
  Star,
  Trash2,
  FolderClosed,
  User,
  Settings,
} from 'lucide-react';

import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from './ui/sidebar';

export function Sidebar() {
  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#' className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  M
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='font-semibold'>My Notes</span>
                  <span className='text-xs text-muted-foreground'>
                    Personal Space
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <Home className='h-4 w-4' />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <Clock className='h-4 w-4' />
                    <span>Recent searches</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <Star className='h-4 w-4' />
                    <span>Starred</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <Trash2 className='h-4 w-4' />
                    <span>Trashed</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <User className='h-4 w-4' />
                    <span>Who</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <FolderClosed className='h-4 w-4' />
                    <span>What</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='#'>
                    <Settings className='h-4 w-4' />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </SidebarContainer>
  );
}
