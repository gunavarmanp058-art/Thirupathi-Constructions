import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Truck,
  Brain,
  MessageSquare,
  Info,
  Wrench,
  Menu,
  X,
  HardHat,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const clientNav = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "My Projects", href: "/client/projects", icon: FolderKanban },
  { name: "AI Reports", href: "/client/ai-reports", icon: Brain },
  { name: "Machinery", href: "/client/machinery", icon: Truck },
  { name: "Services", href: "/client/services", icon: Wrench },
  { name: "Chat", href: "/client/chat", icon: MessageSquare },
  { name: "About", href: "/client/about", icon: Info },
  { name: "Contact", href: "/client/contact", icon: MessageSquare },
];

export function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/client/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-tight">Thirupathi Constructions</p>
              <p className="text-[10px] text-sidebar-foreground/60">Client Portal</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {clientNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {isActive(item.href) && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "Client User"}</p>
              <p className="text-[11px] text-sidebar-foreground/50">{user.email || "client@company.com"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            asChild
          >
            <Link to="/">
              <LogOut className="h-4 w-4" />
              Back to Public Site
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" asChild>
            <Link to="/">View Public Site</Link>
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
