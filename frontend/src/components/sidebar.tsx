import { signOut } from "@/lib/helpers";
import { Home, Inbox, Settings } from "lucide-react";
import { Suspense } from "react";
import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";
import SidebarNotes from "./sidebar-notes";
import { ThemeToggle } from "./theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const newNoteId = uuidv4();

  return (
    <Sidebar>
      <SidebarHeader className="text-2xl font-medium">Shamva</SidebarHeader>
      <SidebarContent className="rounded-r-md">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="h-full flex-col justify-between">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Read</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/articles" prefetch="intent">
                        Articles
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/feeds">Feeds</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Write</SidebarGroupLabel>
          <SidebarGroupAction>
            <Link className="hover:underline" to={`/notes/${newNoteId}`}>
              New
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu className="h-full flex-col justify-between">
              <Suspense fallback={<div>Loading...</div>}>
                <SidebarNotes />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-between space-x-4 pb-4">
        <ThemeToggle />
        <button
          className="rounded-md px-2 py-1 text-start text-sm font-medium hover:bg-accent"
          onClick={async () => await signOut()}
        >
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
