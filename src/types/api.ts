import type { EntityId } from "@/types/common";
import type { UserRole } from "@/types/auth";

export type TenantPlan = "starter" | "growth" | "enterprise";
export type QueryStatus = "pending" | "searching" | "analyzing" | "done" | "failed";
export type QuerySentiment = "positive" | "neutral" | "negative" | "invalid";
export type RunStatus = "queued" | "ready" | "scheduled" | "running" | "completed" | "failed";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";
export type ApiStatus = "healthy" | "degraded" | "down";

export type Tenant = {
  id: EntityId;
  name: string;
  plan: TenantPlan;
  createdAt: string;
};

export type User = {
  id: EntityId;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Brand = {
  id: EntityId;
  tenantId: string;
  name: string;
  website: string;
  industry: string;
  createdAt: string;
};

export type BrandConfigRow = {
  id: EntityId;
  brandId: string;
  countryCode: string;
  countryName: string;
  languageCode: string;
  languageName: string;
  geolocation: string | null;
  keywords: string[];
  runId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QueryRow = {
  id: EntityId;
  tenantId: string;
  brandId: string;
  brandName: string;
  countryCode: string;
  countryName: string;
  languageCode: string;
  languageName: string;
  keyword: string;
  status: QueryStatus;
  selected: boolean;
  score: number;
  runId?: string | null;
};

export type QueryResultUrl = {
  id: EntityId;
  queryRowId: string;
  position: number;
  title: string;
  url: string;
  source: string;
  sentiment: QuerySentiment;
  score: number;
  snippet: string;
};

export type Run = {
  id: EntityId;
  tenantId: string;
  name: string;
  description?: string;
  status: RunStatus;
  createdAt: string;
  executionMode: "now" | "scheduled";
  scheduledFor: string | null;
  taskIds: string[];
  brandId: string;
  brandName: string;
  startedAt: string;
  finishedAt: string | null;
  totalQueries: number;
  completedQueries: number;
  failedQueries: number;
};

export type RunQueryResult = {
  id: EntityId;
  runId: string;
  queryRowId: string;
  keyword: string;
  countryCode: string;
  countryName: string;
  languageCode: string;
  languageName: string;
  status: QueryStatus;
  score: number;
  resultCount: number;
};

export type RunResultTaskGroup = {
  id: EntityId;
  runId: string;
  queryRowId: string;
  keyword: string;
  brandId: string;
  brandName: string;
  countryCode: string;
  countryName: string;
  languageCode: string;
  languageName: string;
  status: QueryStatus;
  score: number;
  resultCount: number;
  urls: QueryResultUrl[];
  summary: {
    positive: number;
    negative: number;
    neutral: number;
  };
};

export type AccountProfile = {
  id: EntityId;
  tenantId: string;
  workspaceName: string;
  companyName: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionPlan: TenantPlan;
  seatCount: number;
};

export type AdminClient = {
  id: EntityId;
  tenantId: string;
  companyName: string;
  subscriptionStatus: SubscriptionStatus;
  seatCount: number;
  billingEmail: string;
};

export type AdminSettings = {
  ignoredDomains: string[];
  concurrencyLimit: number;
  runTimeoutSec: number;
  retryLimit: number;
};

export type SystemHealth = {
  activeRuns: number;
  queueDepth: number;
  failedTasks24h: number;
  tokenUsageToday: number;
  apiStatus: ApiStatus;
};

export type AdminDashboard = {
  systemHealth: SystemHealth;
  activeRuns: Run[];
  tokenUsage: Array<{
    label: string;
    value: number;
  }>;
};

export type LoginPayload = {
  email: string;
  password: string;
  workspaceName: string;
};

export type BrandFormValues = Pick<Brand, "name" | "website" | "industry">;

export type BrandConfigRowFormValues = Pick<
  BrandConfigRow,
  "countryCode" | "countryName" | "languageCode" | "languageName" | "geolocation" | "keywords"
>;

export type AccountProfileFormValues = Pick<
  AccountProfile,
  "workspaceName" | "companyName" | "name" | "email"
>;

export type DashboardQuerySummary = {
  total: number;
  selected: number;
  completed: number;
  failed: number;
};

export type RunTaskOption = {
  id: EntityId;
  brandId: string;
  brandName: string;
  countryCode: string;
  countryName: string;
  languageCode: string;
  languageName: string;
  geolocation: string | null;
  keywords: string[];
};

export type CreateRunPayload = {
  name: string;
  description?: string;
  taskIds: string[];
  executionMode: "now" | "scheduled";
  scheduledFor: string | null;
};
