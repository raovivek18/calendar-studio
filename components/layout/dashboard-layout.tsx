"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isCollapsed} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-[#F9F9F9] dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
