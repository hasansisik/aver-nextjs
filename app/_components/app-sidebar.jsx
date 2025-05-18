"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookText,
  Briefcase,
  Command,
  FolderOpen,
  Globe,
  Layout,
  Newspaper,
  Search,
  Wrench
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
      icon: FolderOpen,
      isActive: true,
      items: [
        {
          title: "All Blogs",
          url: "/dashboard/blog",
          icon: Newspaper,
        },
        {
          title: "All Projects",
          url: "/dashboard/project",
          icon: Briefcase,
        },
        {
          title: "Services",
          url: "/dashboard/services",
          icon: Wrench,
        },
        {
          title: "Glossary",
          url: "/dashboard/glossary",
          icon: BookText,
        },
      ],
    },
    {
      title: "Site",
      url: "#",
      icon: Globe,
      isActive: true,
      items: [
        {
          title: "Header",
          url: "/dashboard/header",
          icon: Layout,
        },
        {
          title: "Footer",
          url: "/dashboard/footer",
          icon: Layout,
        },
        {
          title: "SEO",
          url: "/dashboard/seo",
          icon: Search,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Blogs",
      url: "/dashboard/blog",
      icon: Newspaper,
    },
    {
      name: "Projects",
      url: "/dashboard/project",
      icon: Briefcase,
    },
    {
      name: "Services",
      url: "/dashboard/services",
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
              <a href="/dashboard">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
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
