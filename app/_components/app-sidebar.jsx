"use client"

import * as React from "react"
import {
  Bot,
  Command,
  FileText,
  FolderKanban,
  GanttChart,
  Layout,
  Layers,
  PieChart,
  Settings,
  SquareTerminal,
  Wrench
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Post & Projects",
      url: "#",
      icon: FolderKanban,
      isActive: true,
      items: [
        {
          title: "All Posts",
          url: "#",
          icon: FileText,
        },
        {
          title: "All Projects",
          url: "#",
          icon: GanttChart,
        },
        {
          title: "Services",
          url: "#",
          icon: Wrench,
        },
      ],
    },
    {
      title: "Site",
      url: "#",
      icon: Layout,
      isActive: true,
      items: [
        {
          title: "Header",
          url: "#",
          icon: Layers,
        },
        {
          title: "Footer",
          url: "#",
          icon: Layers,
        },
        {
          title: "Services",
          url: "#",
          icon: Wrench,
        },
        {
          title: "Pages",
          url: "#",
          icon: FileText,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Post",
      url: "#",
      icon: FileText,
    },
    {
      name: "Projects",
      url: "#",
      icon: GanttChart,
    },
    {
      name: "Services",
      url: "#",
      icon: Wrench,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Aver</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />      
        </SidebarContent>
    </Sidebar>)
  );
}
