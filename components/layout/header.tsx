"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Plus, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function Header({ toggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Simple breadcrumb logic based on pathname
  const title = pathname.split("/").pop() || "Dashboard";
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-4">
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-50">
          {formattedTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            id="global-search-input"
            type="search"
            placeholder="Search posts (Cmd+K)"
            className="h-9 w-64 rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700"
          />
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
        >
          <div className="h-5 w-5 rounded-full border-2 border-current" />
        </button>

        <button className="relative rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
        </button>

        <Button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-new-post-dialog'))}
          className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Post</span>
        </Button>
      </div>
    </header>
  );
}
