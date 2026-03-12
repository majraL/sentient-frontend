"use client";

import type { Session } from "@/types/auth";
import { SESSION_COOKIE, SESSION_STORAGE_KEY } from "@/lib/auth/tokens";

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function persistSession(session: Session) {
  if (typeof window === "undefined") {
    return;
  }

  const encoded = encodeURIComponent(JSON.stringify(session));
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  document.cookie = `${SESSION_COOKIE}=${encoded}; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
