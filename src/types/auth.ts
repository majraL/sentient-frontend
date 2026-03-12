export type UserRole = "client_admin" | "client_user" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
};

export type Session = {
  user: SessionUser;
  loggedInAt: string;
};
