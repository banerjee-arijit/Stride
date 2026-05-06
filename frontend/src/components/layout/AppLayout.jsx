import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  CheckCircle2,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  User,
  WifiOff
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { Button } from "../ui/button";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/profile", label: "Profile", icon: User }
];

export default function AppLayout({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const online = useOnlineStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("task_tracker_sidebar") === "collapsed"
  );

  useEffect(() => {
    localStorage.setItem("task_tracker_sidebar", sidebarCollapsed ? "collapsed" : "expanded");
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r bg-card transition-all duration-300 md:block ${
          sidebarCollapsed ? "w-16 px-2 py-5" : "w-64 p-5"
        }`}
      >
        <div className={`mb-8 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between gap-3"}`}>
          <Link
            to="/"
            className={`flex min-w-0 items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}
            title="Stride"
          >
            <div className={`${sidebarCollapsed ? "h-9 w-9" : "h-10 w-10"} flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate font-semibold">Stride</p>
                <p className="truncate text-xs text-muted-foreground">Plan. Focus. Finish.</p>
              </div>
            )}
          </Link>

          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="mb-5 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                `relative flex items-center rounded-md py-2 text-sm font-medium transition ${
                  sidebarCollapsed ? "h-10 justify-center px-0" : "gap-3 px-3"
                } ${
                  isActive
                    ? sidebarCollapsed
                      ? "bg-primary/10 text-primary"
                      : "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !sidebarCollapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  {isActive && sidebarCollapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon className="h-4 w-4" />
                  {!sidebarCollapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "md:pl-16" : "md:pl-64"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-semibold">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {!online && (
          <div className="border-b border-accent/30 bg-accent/10 px-4 py-3 text-accent-foreground md:px-8">
            <div className="flex items-center gap-2 text-sm font-medium">
              <WifiOff className="h-4 w-4" />
              You are offline. Please connect to the internet.
            </div>
          </div>
        )}

        <main className="p-4 md:p-8">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t bg-card md:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-3 text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
