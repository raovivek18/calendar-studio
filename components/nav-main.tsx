"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.title}>
                <motion.div whileTap={{ scale: 0.98 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }}>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    isActive={isActive} 
                    className="relative overflow-hidden group"
                    render={<Link href={item.url} />}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavMain"
                        className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-md z-0"
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
