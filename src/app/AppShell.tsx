/**
 * AppShell.tsx
 * -------------------------------------------------------
 * Layout Nexus-like (night):
 * - Sidebar fixe desktop + drawer mobile
 * - Topbar avec burger, search, actions, profil
 * - Breadcrumb simple (Nexus > Dashboard)
 * - Styles daisyUI + Tailwind (responsive)
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

import { clearAccessToken, isAuthenticated } from "../lib/auth";

type Props = { children: React.ReactNode };

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SidebarItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = pathname === item.to;

  return (
    <Link
      to={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-base-200 text-base-content"
          : "text-base-content/70 hover:bg-base-200/70 hover:text-base-content",
      )}
    >
      <span
        className={cn(
          "opacity-90",
          active ? "text-primary" : "group-hover:text-primary",
        )}
      >
        {item.icon}
      </span>
      <span>{item.label}</span>
      <span
        className={cn(
          "ml-auto opacity-0 group-hover:opacity-100 transition",
          active && "opacity-100",
        )}
      >
        <ChevronRight size={16} />
      </span>
    </Link>
  );
}

/** Simple breadcrumb style Nexus (Nexus > Section) */
function Breadcrumb() {
  const { pathname } = useLocation();

  const section = useMemo(() => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/projects")) return "Projets";
    if (pathname.startsWith("/tasks")) return "Tâches";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/login")) return "Login";
    if (pathname.startsWith("/register")) return "Register";
    return "Page";
  }, [pathname]);

  return (
    <div className="hidden md:flex items-center gap-2 text-sm text-base-content/60">
      <span className="font-medium text-base-content/70">Nexus</span>
      <ChevronRight size={16} className="opacity-60" />
      <span className="font-medium text-base-content/80">{section}</span>
    </div>
  );
}

export default function AppShell({ children }: Props) {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  // NAV: tes pages
  const navOverview: NavItem[] = useMemo(
    () => [
      { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { to: "/projects", label: "Projets", icon: <FolderKanban size={18} /> },
      { to: "/tasks", label: "Tâches", icon: <CheckSquare size={18} /> },
    ],
    [],
  );

  function logout() {
    clearAccessToken();
    navigate("/login", { replace: true });
  }

  return (
    // Background Nexus-like (dark + subtle depth)
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="drawer lg:drawer-open">
        <input id="pm-drawer" type="checkbox" className="drawer-toggle" />

        {/* MAIN */}
        <div className="drawer-content flex flex-col">
          {/* TOPBAR */}
          <header className="sticky top-0 z-30 border-b border-base-200/60 bg-base-100/70 backdrop-blur">
            <div className="navbar px-3 lg:px-6">
              {/* Burger (mobile) */}
              <div className="flex-none lg:hidden">
                <label htmlFor="pm-drawer" className="btn btn-ghost btn-square">
                  <Menu size={20} />
                </label>
              </div>

              {/* Search (Nexus-like input pill) */}
              <div className="flex-1 items-center gap-4">
                <div className="hidden md:flex w-full max-w-md">
                  <label className="input input-bordered w-full flex items-center gap-2 rounded-2xl">
                    <Search size={18} className="opacity-70" />
                    <input
                      type="text"
                      className="grow"
                      placeholder="Search"
                      onChange={() => {}}
                    />
                    <kbd className="kbd kbd-sm opacity-70">⌘K</kbd>
                  </label>
                </div>
              </div>

              {/* Right actions */}
              <div className="flex-none gap-2">
                <button
                  className="btn btn-ghost btn-circle"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </button>

                <Link
                  className="btn btn-ghost btn-circle"
                  to="/settings"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </Link>

                {/* Profile */}
                {authed ? (
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost rounded-2xl gap-3 px-3"
                      aria-label="Profile menu"
                    >
                      <div className="avatar placeholder">
                        <div className="bg-base-200 rounded-xl w-9">
                          <User size={18} />
                        </div>
                      </div>
                      <div className="hidden sm:block text-left leading-tight">
                        <div className="text-sm font-semibold">User</div>
                        <div className="text-xs opacity-60">Team</div>
                      </div>
                    </div>

                    <ul
                      tabIndex={0}
                      className="menu dropdown-content mt-3 w-56 rounded-2xl border border-base-200 bg-base-100 shadow-xl p-2"
                    >
                      <li>
                        <Link to="/settings">
                          <Settings size={16} />
                          Settings
                        </Link>
                      </li>
                      <li>
                        <button onClick={logout}>
                          <LogOut size={16} />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="hidden sm:flex gap-2">
                    <Link
                      className="btn btn-ghost btn-sm rounded-xl"
                      to="/login"
                    >
                      Login
                    </Link>
                    <Link
                      className="btn btn-primary btn-sm rounded-xl"
                      to="/register"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE HEADER (title + breadcrumb) */}
          <div className="px-4 lg:px-8 pt-6">
            <div className="mx-auto max-w-6xl flex items-center justify-between">
              <div className="flex items-end gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Project Manager Dashboard
                </h1>
              </div>
              <Breadcrumb />
            </div>
          </div>

          {/* CONTENT */}
          <main className="px-4 py-6 lg:px-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>

        {/* SIDEBAR */}
        <div className="drawer-side">
          <label htmlFor="pm-drawer" className="drawer-overlay" />

          <aside className="w-80 bg-base-100 border-r border-base-200/60 min-h-full flex flex-col">
            {/* Logo */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <LayoutDashboard size={18} />
                </div>
                <div className="leading-tight">
                  <div className="text-2xl font-semibold tracking-tight">
                    Project Manager
                  </div>
                  <div className="text-xs opacity-60">Overview</div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="px-4">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 px-2 mb-2">
                Overview
              </div>
              <nav className="space-y-1">
                {navOverview.map((item) => (
                  <SidebarItem key={item.to} item={item} />
                ))}
              </nav>

              <div className="divider my-6 opacity-60" />

              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 px-2 mb-2">
                Extras
              </div>
              <nav className="space-y-1">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-base-content/70 hover:bg-base-200/70 hover:text-base-content transition"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>

            {/* Bottom user card */}
            <div className="mt-auto p-4">
              <div className="rounded-2xl border border-base-200 bg-base-200/30 p-3 flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-base-200 rounded-xl w-10">
                    <User size={18} />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {authed ? "Connected user" : "Guest"}
                  </div>
                  <div className="text-xs opacity-60 truncate">
                    {authed ? "Access granted" : "Please login"}
                  </div>
                </div>
              </div>

              {authed ? (
                <button
                  className="btn btn-ghost btn-sm w-full mt-3 rounded-xl justify-start"
                  onClick={logout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
