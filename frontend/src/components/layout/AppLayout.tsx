"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/auth/authSlice";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/permissions";
import toast from "react-hot-toast";

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TasksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.1 1.7 1.7 0 0 0-1.1-.4 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.1 1.7 1.7 0 0 0 1.1.4 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.26.36.47.76.6 1.2.13.44.2.9.2 1.37 0 .47-.07.93-.2 1.37a1.7 1.7 0 0 0-.6 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", Icon: DashboardIcon },
  { href: ROUTES.PROJECTS, label: "Projects", Icon: ProjectsIcon },
  { href: ROUTES.TASKS, label: "Tasks", Icon: TasksIcon },
];

function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              vertical
                ? active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-indigo-100 hover:bg-white/10 hover:text-white"
                : active
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-600 shadow-sm hover:bg-indigo-50"
            )}
          >
            <item.Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  return (
    <aside
      className="hidden h-screen w-64 shrink-0 flex-col overflow-hidden text-white lg:flex"
      style={{ background: "var(--sidebar)" }}
    >
      <div className="border-b border-white/15 px-3 py-3">
        <h1 className="text-2xl font-bold">SyncBoard</h1>
        <p className="text-sm text-indigo-100/90">Collaborate in real time</p>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        <NavLinks vertical />
      </nav>
      <div className="border-t border-white/15 p-4 text-xs text-indigo-100/80">
        Optimistic boards · Live task sync
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2.5 lg:hidden">
      <NavLinks />
    </nav>
  );
}

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await dispatch(logout());
    toast.success("Logged out successfully");
    router.replace(ROUTES.LOGIN);
  };

  return (
    <header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3 py-3 backdrop-blur sm:px-4 sm:py-4 md:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-md sm:h-11 sm:w-11">
          {getInitials(user ?? undefined)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {user ? `${user.firstName} ${user.lastName}` : "User"}
          </p>
          <p className="truncate text-xs text-indigo-600 lg:hidden">SyncBoard</p>
          {user && (
            <p className="hidden text-xs capitalize text-slate-500 sm:block">{user.role} account</p>
          )}
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open settings menu"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <SettingsIcon className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  {user && (
                    <p className="mt-0.5 text-xs capitalize text-indigo-600">{user.role} account</p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-3 py-3">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full cursor-pointer rounded-xl px-2 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <MobileNav />
        <div className="main-scroll min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
