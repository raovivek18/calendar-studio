"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useUser } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, Settings2Icon, CommandIcon, MegaphoneIcon } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: (
        <ListIcon
        />
      ),
    },
    {
      title: "Social Planner",
      url: "/planner",
      icon: (
        <MegaphoneIcon
        />
      ),
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: (
        <ChartBarIcon
        />
      ),
    },
    {
      title: "Library",
      url: "/library",
      icon: (
        <FolderIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  
  const userData = {
    name: user?.fullName || "User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    avatar: user?.imageUrl || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! h-auto py-2"
              render={<a href="/dashboard" />}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              >
                <div className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 p-1 rounded-md">
                  <CommandIcon className="size-4!" />
                </div>
                <span className="text-base font-semibold flex items-center">
                  Calendar
                  <span className="ml-1.5 -translate-y-[2px] rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-700">
                    Studio
                  </span>
                </span>
              </motion.div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}