import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@clerk/nextjs/server"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await auth.protect();
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 bg-[#F9F9F9] dark:bg-zinc-950">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
