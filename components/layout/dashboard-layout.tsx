"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("./command-palette").then(m => m.CommandPalette), {
  ssr: false,
});

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-new-post-dialog'));
      }
      
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const toggleMobileSidebar = () => setIsMobileOpen(p => !p);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-zinc-950">
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0">
          <Sidebar isCollapsed={false} toggleSidebar={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header 
          toggleSidebar={toggleMobileSidebar} 
          isSidebarCollapsed={true} 
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-[#F9F9F9] dark:bg-zinc-950">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
