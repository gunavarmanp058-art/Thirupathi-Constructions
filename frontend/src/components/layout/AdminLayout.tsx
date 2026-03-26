import { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Truck,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  HardHat,
  LogOut,
  ChevronRight,
  Shield,
  Upload,
  Mail,
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Link as RouterLink } from "react-router-dom";

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Upload Progress", href: "/admin/upload-progress", icon: Upload },
  { name: "Machinery", href: "/admin/machinery", icon: Truck },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Chat", href: "/admin/chat", icon: MessageSquare },
  { name: "Enquiries", href: "/admin/enquiries", icon: Mail },
  { name: "AI & Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead, clearAll } =
    useAdminNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="admin-notification-bell"
        onClick={handleOpen}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
          unreadCount > 0
            ? "bg-primary/15 text-primary hover:bg-primary/25"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 animate-pulse" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    title="Mark all read"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={clearAll}
                    title="Clear all"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Bell className="h-8 w-8 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className={cn(
                    "flex gap-3 px-4 py-3 cursor-pointer transition-colors",
                    n.read ? "bg-background" : "bg-primary/5 hover:bg-primary/8"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5",
                      n.read ? "bg-muted" : "bg-primary/15"
                    )}
                  >
                    <MessageSquare
                      className={cn(
                        "h-4 w-4",
                        n.read ? "text-muted-foreground" : "text-primary"
                      )}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {n.name}
                      </p>
                      {!n.read && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-primary font-medium">
                      {n.enquiry_type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/70">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 bg-muted/30">
            <RouterLink
              to="/admin/enquiries"
              onClick={() => setOpen(false)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              View all enquiries →
            </RouterLink>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

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
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          "bg-[hsl(160,20%,10%)] text-white",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-tight">Thirupathi Constructions</p>
              <p className="text-[10px] text-white/50 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                Admin Panel
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {isActive(item.href) && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Admin user / logout */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "Admin User"}</p>
              <p className="text-[11px] text-white/40">{user.email || "thiruppathi400@gmail.com"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/60 hover:bg-white/10 hover:text-white"
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
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
          </div>
          <div className="flex-1" />

          {/* 🔔 Notification Bell */}
          <NotificationBell />

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
