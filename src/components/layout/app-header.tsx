"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Shield, UserCircle2 } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AppHeaderProps = {
  title: string;
  subtitle: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="flex flex-col gap-4 border-b border-white/8 bg-[#0b1321]/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Signed-in tenant workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101a2c] px-3 py-2 text-left transition-colors hover:bg-[#162238]"
          >
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Shield className="size-3.5" />
                {user?.role?.replace("_", " ")}
              </p>
            </div>
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-[#101a2c] p-1 shadow-2xl">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(ROUTES.account);
                }}
              >
                <UserCircle2 className="size-4" />
                Account
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
