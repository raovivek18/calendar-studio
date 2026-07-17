"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Inbox, 
  Library, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  CircleDashed,
  CheckCircle2,
  Clock,
  Home,
  MessageCircle,
  Briefcase,
  Megaphone
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Social Planner", href: "/planner", icon: Megaphone },
    { name: "Library", href: "/library", icon: Library },
    { name: "Inbox", href: "/inbox", icon: Inbox },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        {!isCollapsed && (
          <span className="font-semibold tracking-tight text-lg flex items-center">
            Calendar
            <span className="ml-1 -translate-y-1 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white dark:bg-zinc-100 dark:text-zinc-900">
              Studio
            </span>
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                pathname === item.href
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              <item.icon size={18} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {!isCollapsed && (
          <>
            <div className="mt-8 px-5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Views
            </div>
            <nav className="mt-2 space-y-1 px-2">
              <Link href="/calendar?view=needs-date" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                Needs Date
              </Link>
              <Link href="/calendar?view=this-week" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                This Week
              </Link>
            </nav>

            <div className="mt-8 px-5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </div>
            <nav className="mt-2 space-y-1 px-2">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500">
                <CircleDashed size={16} /> Draft
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500">
                <CheckCircle2 size={16} className="text-green-500" /> Ready
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500">
                <Clock size={16} className="text-blue-500" /> Scheduled
              </div>
            </nav>

            <div className="mt-8 px-5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Platforms
            </div>
            <nav className="mt-2 space-y-1 px-2">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500">
                <MessageCircle size={16} className="text-[#1DA1F2]" /> Twitter
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500">
                <Briefcase size={16} className="text-[#0A66C2]" /> LinkedIn
              </div>
            </nav>
          </>
        )}
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserButton />
          {!isCollapsed && user && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{user.fullName}</span>
              <span className="text-xs text-zinc-500 truncate">{user.primaryEmailAddress?.emailAddress}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Link href="/settings" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            <Settings size={18} />
          </Link>
        )}
      </div>
    </aside>
  );
}
