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

export const brands: Brand[] = [
  { id: "brand_velora", tenantId: currentTenantId, name: "Velora Skin", website: "https://veloraskin.com", industry: "Beauty", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "brand_lunoro", tenantId: currentTenantId, name: "Lunoro Travel", website: "https://lunorotravel.com", industry: "Travel", createdAt: "2025-01-18T09:00:00.000Z" },
  { id: "brand_klyra", tenantId: currentTenantId, name: "Klyra Home", website: "https://klyrahome.com", industry: "Home", createdAt: "2025-02-01T09:00:00.000Z" },
  { id: "brand_novu", tenantId: currentTenantId, name: "Novu Mobile", website: "https://novumobile.com", industry: "Telecom", createdAt: "2025-02-07T09:00:00.000Z" },
  { id: "brand_marrow", tenantId: currentTenantId, name: "Marrow Nutrition", website: "https://marrownutrition.com", industry: "Wellness", createdAt: "2025-02-19T09:00:00.000Z" },
  { id: "brand_orisel", tenantId: currentTenantId, name: "Orisel Shoes", website: "https://oriselshoes.com", industry: "Fashion", createdAt: "2025-03-03T09:00:00.000Z" },
];

export const brandConfigRows: BrandConfigRow[] = [
  { id: "cfg_1", brandId: "brand_velora", countryCode: "CH", countryName: "Switzerland", languageCode: "en", languageName: "English", geolocation: "Zurich", keywords: ["Velora Skin", "Velora Skin review", "Velora Skin scam"], createdAt: "2026-02-10T08:00:00.000Z", updatedAt: "2026-03-10T08:30:00.000Z" },
  { id: "cfg_2", brandId: "brand_velora", countryCode: "CH", countryName: "Switzerland", languageCode: "de", languageName: "German", geolocation: "Basel", keywords: ["Velora Skin Bewertung", "Velora Skin Erfahrung"], createdAt: "2026-02-10T08:10:00.000Z", updatedAt: "2026-03-10T08:30:00.000Z" },
  { id: "cfg_3", brandId: "brand_velora", countryCode: "CH", countryName: "Switzerland", languageCode: "fr", languageName: "French", geolocation: "Geneva", keywords: ["Velora Skin avis", "Velora Skin arnaque"], createdAt: "2026-02-10T08:20:00.000Z", updatedAt: "2026-03-10T08:30:00.000Z" },
  { id: "cfg_4", brandId: "brand_lunoro", countryCode: "MY", countryName: "Malaysia", languageCode: "ms", languageName: "Malay", geolocation: "Kuala Lumpur", keywords: ["Lunoro Travel", "Lunoro Travel review"], createdAt: "2026-02-12T08:00:00.000Z", updatedAt: "2026-03-09T07:40:00.000Z" },
  { id: "cfg_5", brandId: "brand_lunoro", countryCode: "MY", countryName: "Malaysia", languageCode: "en", languageName: "English", geolocation: null, keywords: ["Lunoro Travel scam", "Lunoro luggage review"], createdAt: "2026-02-12T08:20:00.000Z", updatedAt: "2026-03-09T07:40:00.000Z" },
  { id: "cfg_6", brandId: "brand_novu", countryCode: "IN", countryName: "India", languageCode: "en", languageName: "English", geolocation: "Mumbai", keywords: ["Novu Mobile", "Novu Mobile review"], createdAt: "2026-02-13T08:00:00.000Z", updatedAt: "2026-03-08T09:00:00.000Z" },
  { id: "cfg_7", brandId: "brand_novu", countryCode: "IN", countryName: "India", languageCode: "hi", languageName: "Hindi", geolocation: "Delhi", keywords: ["Novu Mobile review hindi", "Novu Mobile scam"], createdAt: "2026-02-13T08:15:00.000Z", updatedAt: "2026-03-08T09:00:00.000Z" },
  { id: "cfg_8", brandId: "brand_klyra", countryCode: "KR", countryName: "South Korea", languageCode: "ko", languageName: "Korean", geolocation: "Seoul", keywords: ["Klyra Home 후기", "Klyra Home 품질"], createdAt: "2026-02-14T08:00:00.000Z", updatedAt: "2026-03-07T10:00:00.000Z" },
  { id: "cfg_9", brandId: "brand_klyra", countryCode: "KR", countryName: "South Korea", languageCode: "en", languageName: "English", geolocation: null, keywords: ["Klyra Home review"], createdAt: "2026-02-14T08:20:00.000Z", updatedAt: "2026-03-07T10:00:00.000Z" },
  { id: "cfg_10", brandId: "brand_marrow", countryCode: "HR", countryName: "Croatia", languageCode: "hr", languageName: "Croatian", geolocation: "Zagreb", keywords: ["Marrow Nutrition iskustva", "Marrow Nutrition prevara"], createdAt: "2026-02-15T08:00:00.000Z", updatedAt: "2026-03-05T11:00:00.000Z" },
  { id: "cfg_11", brandId: "brand_orisel", countryCode: "HR", countryName: "Croatia", languageCode: "hr", languageName: "Croatian", geolocation: "Split", keywords: ["Orisel Shoes iskustva", "Orisel Shoes review"], createdAt: "2026-02-15T08:10:00.000Z", updatedAt: "2026-03-05T11:00:00.000Z" },
];

export const queryRows: QueryRow[] = [
  { id: "qry_1", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", countryCode: "CH", countryName: "Switzerland", languageCode: "en", languageName: "English", keyword: "Velora Skin", status: "pending", selected: true, score: 0, runId: null },
  { id: "qry_2", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", countryCode: "CH", countryName: "Switzerland", languageCode: "en", languageName: "English", keyword: "Velora Skin review", status: "done", selected: true, score: 0.72, runId: "run_1" },
  { id: "qry_3", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", countryCode: "CH", countryName: "Switzerland", languageCode: "de", languageName: "German", keyword: "Velora Skin Bewertung", status: "searching", selected: false, score: 0, runId: "run_3" },
  { id: "qry_4", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", countryCode: "CH", countryName: "Switzerland", languageCode: "fr", languageName: "French", keyword: "Velora Skin avis", status: "failed", selected: false, score: -0.18, runId: "run_4" },
  { id: "qry_5", tenantId: currentTenantId, brandId: "brand_lunoro", brandName: "Lunoro Travel", countryCode: "MY", countryName: "Malaysia", languageCode: "ms", languageName: "Malay", keyword: "Lunoro Travel", status: "pending", selected: true, score: 0, runId: null },
  { id: "qry_6", tenantId: currentTenantId, brandId: "brand_lunoro", brandName: "Lunoro Travel", countryCode: "MY", countryName: "Malaysia", languageCode: "en", languageName: "English", keyword: "Lunoro Travel scam", status: "done", selected: false, score: -0.21, runId: "run_2" },
  { id: "qry_7", tenantId: currentTenantId, brandId: "brand_novu", brandName: "Novu Mobile", countryCode: "IN", countryName: "India", languageCode: "en", languageName: "English", keyword: "Novu Mobile", status: "pending", selected: true, score: 0, runId: null },
  { id: "qry_8", tenantId: currentTenantId, brandId: "brand_novu", brandName: "Novu Mobile", countryCode: "IN", countryName: "India", languageCode: "hi", languageName: "Hindi", keyword: "Novu Mobile scam", status: "done", selected: false, score: -0.34, runId: "run_5" },
  { id: "qry_9", tenantId: currentTenantId, brandId: "brand_klyra", brandName: "Klyra Home", countryCode: "KR", countryName: "South Korea", languageCode: "ko", languageName: "Korean", keyword: "Klyra Home 후기", status: "analyzing", selected: true, score: 0, runId: "run_6" },
  { id: "qry_10", tenantId: currentTenantId, brandId: "brand_marrow", brandName: "Marrow Nutrition", countryCode: "HR", countryName: "Croatia", languageCode: "hr", languageName: "Croatian", keyword: "Marrow Nutrition iskustva", status: "done", selected: false, score: 0.58, runId: "run_7" },
  { id: "qry_11", tenantId: currentTenantId, brandId: "brand_orisel", brandName: "Orisel Shoes", countryCode: "HR", countryName: "Croatia", languageCode: "hr", languageName: "Croatian", keyword: "Orisel Shoes review", status: "pending", selected: false, score: 0, runId: null },
];

export const queryResultUrls: QueryResultUrl[] = [
  { id: "url_1", queryRowId: "qry_2", position: 1, title: "Velora Skin review roundup shows strong repeat purchase intent", url: "https://beautyinsider.example/velora-review", source: "Beauty Insider", sentiment: "positive", score: 0.84, snippet: "Swiss shoppers praise the hydration results and premium packaging." },
  { id: "url_2", queryRowId: "qry_2", position: 2, title: "Dermatology forum debates Velora Skin pricing", url: "https://forum.example/velora-pricing", source: "Forum", sentiment: "neutral", score: 0.11, snippet: "Users like the ingredients but discuss whether the price is justified." },
  { id: "url_4", queryRowId: "qry_6", position: 1, title: "Travel community warns about fake Lunoro discount page", url: "https://travelalerts.example/lunoro-scam", source: "Community", sentiment: "negative", score: -0.67, snippet: "The conversation centers on a phishing campaign using the brand name." },
  { id: "url_5", queryRowId: "qry_8", position: 1, title: "Hindi creator says Novu Mobile launch is overpriced", url: "https://video.example/novu-launch", source: "YouTube", sentiment: "negative", score: -0.44, snippet: "Reviewers like the battery but criticize the launch price in India." },
  { id: "url_6", queryRowId: "qry_10", position: 1, title: "Croatian wellness reviewers recommend Marrow Nutrition collagen", url: "https://wellness.example/marrow-collagen", source: "Editorial", sentiment: "positive", score: 0.79, snippet: "The product is praised for taste and clear ingredient labeling." },
];

export const runs: Run[] = [
  { id: "run_1", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", name: "Velora CH English - Morning sweep", status: "completed", startedAt: "2026-03-12T06:15:00.000Z", finishedAt: "2026-03-12T06:19:00.000Z", totalQueries: 3, completedQueries: 3, failedQueries: 0 },
  { id: "run_2", tenantId: currentTenantId, brandId: "brand_lunoro", brandName: "Lunoro Travel", name: "Malaysia scam monitoring", status: "completed", startedAt: "2026-03-11T13:10:00.000Z", finishedAt: "2026-03-11T13:14:00.000Z", totalQueries: 2, completedQueries: 2, failedQueries: 0 },
  { id: "run_3", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", name: "German review search", status: "running", startedAt: "2026-03-12T08:05:00.000Z", finishedAt: null, totalQueries: 1, completedQueries: 0, failedQueries: 0 },
  { id: "run_4", tenantId: currentTenantId, brandId: "brand_velora", brandName: "Velora Skin", name: "French complaint scan", status: "failed", startedAt: "2026-03-10T15:40:00.000Z", finishedAt: "2026-03-10T15:43:00.000Z", totalQueries: 1, completedQueries: 0, failedQueries: 1 },
  { id: "run_5", tenantId: currentTenantId, brandId: "brand_novu", brandName: "Novu Mobile", name: "India launch watch", status: "completed", startedAt: "2026-03-11T10:20:00.000Z", finishedAt: "2026-03-11T10:29:00.000Z", totalQueries: 2, completedQueries: 2, failedQueries: 0 },
  { id: "run_6", tenantId: currentTenantId, brandId: "brand_klyra", brandName: "Klyra Home", name: "South Korea product quality", status: "running", startedAt: "2026-03-12T08:40:00.000Z", finishedAt: null, totalQueries: 2, completedQueries: 1, failedQueries: 0 },
  { id: "run_7", tenantId: currentTenantId, brandId: "brand_marrow", brandName: "Marrow Nutrition", name: "Croatia trust check", status: "completed", startedAt: "2026-03-09T11:00:00.000Z", finishedAt: "2026-03-09T11:07:00.000Z", totalQueries: 1, completedQueries: 1, failedQueries: 0 },
];

export const runQueryResults: RunQueryResult[] = [
  { id: "rqr_1", runId: "run_1", queryRowId: "qry_1", keyword: "Velora Skin", countryCode: "CH", countryName: "Switzerland", languageCode: "en", languageName: "English", status: "done", score: 0.63, resultCount: 10 },
  { id: "rqr_2", runId: "run_1", queryRowId: "qry_2", keyword: "Velora Skin review", countryCode: "CH", countryName: "Switzerland", languageCode: "en", languageName: "English", status: "done", score: 0.72, resultCount: 10 },
  { id: "rqr_3", runId: "run_2", queryRowId: "qry_5", keyword: "Lunoro Travel", countryCode: "MY", countryName: "Malaysia", languageCode: "ms", languageName: "Malay", status: "done", score: 0.22, resultCount: 10 },
  { id: "rqr_4", runId: "run_2", queryRowId: "qry_6", keyword: "Lunoro Travel scam", countryCode: "MY", countryName: "Malaysia", languageCode: "en", languageName: "English", status: "done", score: -0.21, resultCount: 10 },
  { id: "rqr_5", runId: "run_3", queryRowId: "qry_3", keyword: "Velora Skin Bewertung", countryCode: "CH", countryName: "Switzerland", languageCode: "de", languageName: "German", status: "searching", score: 0, resultCount: 0 },
  { id: "rqr_6", runId: "run_4", queryRowId: "qry_4", keyword: "Velora Skin avis", countryCode: "CH", countryName: "Switzerland", languageCode: "fr", languageName: "French", status: "failed", score: -0.18, resultCount: 0 },
  { id: "rqr_7", runId: "run_5", queryRowId: "qry_7", keyword: "Novu Mobile", countryCode: "IN", countryName: "India", languageCode: "en", languageName: "English", status: "done", score: 0.18, resultCount: 10 },
  { id: "rqr_8", runId: "run_5", queryRowId: "qry_8", keyword: "Novu Mobile scam", countryCode: "IN", countryName: "India", languageCode: "hi", languageName: "Hindi", status: "done", score: -0.34, resultCount: 10 },
  { id: "rqr_9", runId: "run_6", queryRowId: "qry_9", keyword: "Klyra Home 후기", countryCode: "KR", countryName: "South Korea", languageCode: "ko", languageName: "Korean", status: "analyzing", score: 0, resultCount: 0 },
  { id: "rqr_10", runId: "run_7", queryRowId: "qry_10", keyword: "Marrow Nutrition iskustva", countryCode: "HR", countryName: "Croatia", languageCode: "hr", languageName: "Croatian", status: "done", score: 0.58, resultCount: 10 },
];

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
