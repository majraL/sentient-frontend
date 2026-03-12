export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  configuration: "/configuration",
  runs: "/runs",
  account: "/account",
  adminDashboard: "/admin/dashboard",
  adminClients: "/admin/clients",
  adminSettings: "/admin/settings",
} as const;

export const CLIENT_NAV_ITEMS = [
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.configuration, label: "Configuration" },
  { href: ROUTES.runs, label: "Runs" },
  { href: ROUTES.account, label: "Account" },
];

export const ADMIN_NAV_ITEMS = [
  { href: ROUTES.adminDashboard, label: "Dashboard" },
  { href: ROUTES.adminClients, label: "Clients" },
  { href: ROUTES.adminSettings, label: "Settings" },
];

export function getRunRoute(id: string) {
  return `/runs/${id}`;
}
