import type { SessionUser, UserRole } from "@/types/auth";

export function isAdmin(user: SessionUser | null) {
  return user?.role === "admin";
}

export function hasRole(user: SessionUser | null, roles: UserRole[]) {
  return !!user && roles.includes(user.role);
}
