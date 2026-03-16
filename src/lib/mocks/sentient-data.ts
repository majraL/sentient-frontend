import type {
  AccountProfile,
  AdminClient,
  AdminSettings,
  Brand,
  BrandConfigRow,
  QueryResultUrl,
  QueryRow,
  Run,
  RunQueryResult,
  Tenant,
  User,
} from "@/types/api";

export const currentTenantId = "tenant_alpine";
export const currentAccountId = "account_alpine";
export const currentUserId = "user_ana";

export const tenants: Tenant[] = [
  {
    id: "tenant_alpine",
    name: "Alpine Retail Group",
    plan: "growth",
    createdAt: "2024-06-12T08:00:00.000Z",
  },
];

export const users: User[] = [
  {
    id: currentUserId,
    tenantId: currentTenantId,
    name: "Ana Kovac",
    email: "ana@alpineretail.com",
    role: "client_admin",
  },
  {
    id: "user_ivan",
    tenantId: currentTenantId,
    name: "Ivan Horvat",
    email: "ivan@alpineretail.com",
    role: "client_user",
  },
  {
    id: "user_admin",
    tenantId: currentTenantId,
    name: "Platform Admin",
    email: "admin@sentient.app",
    role: "admin",
  },
];

export const brands: Brand[] = [];

export const brandConfigRows: BrandConfigRow[] = [];

export const queryRows: QueryRow[] = [];

export const queryResultUrls: QueryResultUrl[] = [];

export const runs: Run[] = [];

export const runQueryResults: RunQueryResult[] = [];

export const accountProfile: AccountProfile = {
  id: currentAccountId,
  tenantId: currentTenantId,
  companyName: "Alpine Retail Group",
  name: "Ana Kovac",
  email: "ana@alpineretail.com",
  role: "client_admin",
  subscriptionPlan: "growth",
  seatCount: 9,
};

export const adminClients: AdminClient[] = [
  { id: "adm_1", tenantId: currentTenantId, companyName: "Alpine Retail Group", subscriptionStatus: "active", seatCount: 9, billingEmail: "finance@alpineretail.com" },
  { id: "adm_2", tenantId: "tenant_fjord", companyName: "Fjord Health Labs", subscriptionStatus: "trialing", seatCount: 4, billingEmail: "billing@fjordlabs.com" },
  { id: "adm_3", tenantId: "tenant_meridian", companyName: "Meridian Commerce", subscriptionStatus: "active", seatCount: 15, billingEmail: "ar@meridiancommerce.io" },
  { id: "adm_4", tenantId: "tenant_saffron", companyName: "Saffron Foods International", subscriptionStatus: "past_due", seatCount: 7, billingEmail: "finance@saffronfoods.co" },
];

export const adminSettings: AdminSettings = {
  ignoredDomains: ["spam-directory.net", "thincontent.example"],
  concurrencyLimit: 16,
  runTimeoutSec: 1200,
  retryLimit: 2,
};
