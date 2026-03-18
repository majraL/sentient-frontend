import { addMinutes, formatISO } from "date-fns";
import { API_DELAY_MS } from "@/lib/constants/app";
import { ApiError } from "@/lib/api/errors";
import { createId } from "@/lib/api/server";
import {
  accountProfile,
  adminClients,
  adminSettings,
  brandConfigRows,
  brands,
  currentTenantId,
  queryResultUrls,
  queryRows,
  runQueryResults,
  runs,
  users,
} from "@/lib/mocks/sentient-data";
import type {
  AccountProfileFormValues,
  AdminDashboard,
  AdminSettings,
  Brand,
  BrandConfigRow,
  BrandConfigRowFormValues,
  BrandFormValues,
  CreateRunPayload,
  LoginPayload,
  QueryResultUrl,
  QueryRow,
  Run,
  RunQueryResult,
  RunResultTaskGroup,
  RunTaskOption,
  SystemHealth,
} from "@/types/api";
import type { Session, SessionUser } from "@/types/auth";

const resultSourcePool = [
  "News",
  "Forum",
  "Review Site",
  "Editorial",
  "YouTube",
  "Blog",
  "Community",
  "Reddit",
  "LinkedIn",
  "X",
];

function delay(ms = API_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function simulate<T>(value: T) {
  await delay();
  return clone(value);
}

function requireValue<T>(value: T | undefined, message: string) {
  if (!value) {
    throw new ApiError(message, 404);
  }
  return value;
}

function replaceCollection<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

function clearTenantDataCollections() {
  brands.splice(0, brands.length);
  brandConfigRows.splice(0, brandConfigRows.length);
  queryRows.splice(0, queryRows.length);
  queryResultUrls.splice(0, queryResultUrls.length);
  runs.splice(0, runs.length);
  runQueryResults.splice(0, runQueryResults.length);
}

function buildSessionUser(email: string): SessionUser {
  if (email === "admin@sentient.app") {
    return {
      id: "user_admin",
      name: "Platform Admin",
      email,
      role: "admin",
      tenantId: null,
    };
  }

  const user = users.find((item) => item.tenantId === currentTenantId) ?? users[0];
  return {
    id: user.id,
    name: user.name,
    email,
    role: "client_admin",
    tenantId: currentTenantId,
  };
}

function getBrandByIdUnsafe(brandId: string) {
  return requireValue(brands.find((brand) => brand.id === brandId), "Brand not found");
}

function getQueryRowsForBrand(brandId: string) {
  return queryRows.filter((row) => row.brandId === brandId);
}

function inferSentiment(score: number) {
  if (score >= 0.3) {
    return "positive" as const;
  }

  if (score <= -0.1) {
    return "negative" as const;
  }

  return "neutral" as const;
}

function ensureTenResultsForQuery(queryRowId: string) {
  const row = queryRows.find((item) => item.id === queryRowId);
  if (!row || row.status !== "done") {
    return [];
  }

  const existing = queryResultUrls
    .filter((result) => result.queryRowId === queryRowId)
    .sort((a, b) => a.position - b.position);

  if (existing.length >= 10) {
    return existing.slice(0, 10);
  }

  const results = [...existing];
  const sentiment = inferSentiment(row.score);
  const fallbackScores =
    sentiment === "positive"
      ? [0.82, 0.74, 0.66, 0.58, 0.51, 0.43, 0.34, 0.28, 0.19, 0.12]
      : sentiment === "negative"
        ? [-0.62, -0.55, -0.48, -0.39, -0.31, -0.24, -0.16, -0.11, -0.05, 0.02]
        : [0.14, 0.09, 0.05, 0.02, 0, -0.01, -0.03, 0.04, 0.08, 0.11];

  for (let index = results.length; index < 10; index += 1) {
    results.push({
      id: createId("url"),
      queryRowId,
      position: index + 1,
      title: `${row.keyword} result ${index + 1} in ${row.countryName}`,
      url: `https://search.sentient.example/${queryRowId}/${index + 1}`,
      source: resultSourcePool[index % resultSourcePool.length],
      sentiment:
        index % 4 === 0 && sentiment === "positive"
          ? "neutral"
          : index % 5 === 0 && sentiment === "negative"
            ? "neutral"
            : sentiment,
      score: fallbackScores[index],
      snippet: `Result ${index + 1} for ${row.keyword} across ${row.languageName} search coverage.`,
    });
  }

  queryResultUrls.push(...results.slice(existing.length));
  return results;
}

function setRunAggregate(runId: string) {
  const run = runs.find((item) => item.id === runId);
  if (!run) {
    return;
  }
  const results = runQueryResults.filter((item) => item.runId === runId);
  run.completedQueries = results.filter((item) => item.status === "done").length;
  run.failedQueries = results.filter((item) => item.status === "failed").length;
  run.status =
    run.failedQueries > 0 && run.completedQueries + run.failedQueries === run.totalQueries
      ? "failed"
      : run.completedQueries === run.totalQueries
        ? "completed"
        : "running";
  run.finishedAt = run.status === "completed" ? formatISO(addMinutes(new Date(run.startedAt), 4)) : run.finishedAt;
}

export async function login(payload: LoginPayload): Promise<Session> {
  if (!payload.email || !payload.password) {
    throw new ApiError("Email and password are required", 400);
  }
  return simulate({
    user: buildSessionUser(payload.email.trim().toLowerCase()),
    loggedInAt: new Date().toISOString(),
  });
}

export async function logout() {
  return simulate({ success: true });
}

export async function getCurrentUser(email?: string) {
  return simulate(email ? buildSessionUser(email) : null);
}

export async function getDashboardBrands() {
  return simulate(brands.filter((brand) => brand.tenantId === currentTenantId));
}

export async function getDashboardQueryRows(brandId: string) {
  return simulate(getQueryRowsForBrand(brandId));
}

export async function updateQuerySelection(queryRowId: string, selected: boolean) {
  const row = requireValue(queryRows.find((item) => item.id === queryRowId), "Query row not found");
  row.selected = selected;
  return simulate(row);
}

export async function updateManyQuerySelections(queryRowIds: string[], selected: boolean) {
  queryRows.forEach((row) => {
    if (queryRowIds.includes(row.id)) {
      row.selected = selected;
    }
  });
  return simulate(queryRows.filter((row) => queryRowIds.includes(row.id)));
}

export async function runSelectedQueries(brandId: string) {
  const selectedRows = getQueryRowsForBrand(brandId).filter((row) => row.selected);
  if (!selectedRows.length) {
    throw new ApiError("Select at least one query row", 400);
  }

  const brand = getBrandByIdUnsafe(brandId);
  const runId = createId("run");
  const now = new Date().toISOString();
  const run: Run = {
    id: runId,
    tenantId: currentTenantId,
    brandId,
    brandName: brand.name,
    name: `${brand.name} ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} search`,
    status: "running",
    createdAt: now,
    executionMode: "now",
    scheduledFor: null,
    taskIds: [],
    startedAt: now,
    finishedAt: null,
    totalQueries: selectedRows.length,
    completedQueries: 0,
    failedQueries: 0,
  };
  runs.unshift(run);

  selectedRows.forEach((row) => {
    row.status = "searching";
    row.runId = runId;
    const existing = runQueryResults.find((item) => item.runId === runId && item.queryRowId === row.id);
    if (!existing) {
      runQueryResults.unshift({
        id: createId("rqr"),
        runId,
        queryRowId: row.id,
        keyword: row.keyword,
        countryCode: row.countryCode,
        countryName: row.countryName,
        languageCode: row.languageCode,
        languageName: row.languageName,
        status: "searching",
        score: 0,
        resultCount: 0,
      });
    }
  });

  return simulate(run);
}

export async function analyzeCompletedQueries(brandId: string) {
  const rows = getQueryRowsForBrand(brandId).filter((row) => row.selected || row.status === "searching" || row.status === "analyzing");
  if (!rows.length) {
    throw new ApiError("No query rows available for analysis", 400);
  }

  rows.forEach((row, index) => {
    row.status = index % 5 === 0 ? "failed" : "done";
    row.score = row.status === "done" ? Number((0.18 + (index + 1) * 0.11).toFixed(2)) : -0.12;

    const runResult = runQueryResults.find((item) => item.queryRowId === row.id && item.runId === row.runId);
    if (runResult) {
      runResult.status = row.status;
      runResult.score = row.score;
      runResult.resultCount = row.status === "done" ? 10 : 0;
      setRunAggregate(runResult.runId);
    }

    if (row.status === "done") {
      ensureTenResultsForQuery(row.id);
    }
  });

  return simulate(rows);
}

export async function getQueryResults(queryRowId: string) {
  return simulate(ensureTenResultsForQuery(queryRowId));
}

export async function saveReport() {
  return simulate({ success: true });
}

export async function getBrands() {
  return simulate(brands.filter((brand) => brand.tenantId === currentTenantId));
}

export async function getBrandConfigRows(brandId: string) {
  return simulate(brandConfigRows.filter((row) => row.brandId === brandId));
}

export async function createBrand(payload: BrandFormValues) {
  const brand: Brand = {
    id: createId("brand"),
    tenantId: currentTenantId,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  brands.push(brand);
  return simulate(brand);
}

export async function updateBrand(brandId: string, payload: BrandFormValues) {
  const brand = getBrandByIdUnsafe(brandId);
  Object.assign(brand, payload);
  queryRows.forEach((row) => {
    if (row.brandId === brandId) {
      row.brandName = brand.name;
    }
  });
  runs.forEach((run) => {
    if (run.brandId === brandId) {
      run.brandName = brand.name;
    }
  });
  return simulate(brand);
}

export async function createBrandConfigRow(brandId: string, payload: BrandConfigRowFormValues) {
  const row: BrandConfigRow = {
    id: createId("cfg"),
    brandId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
  };
  brandConfigRows.unshift(row);
  payload.keywords.forEach((keyword) => {
    queryRows.unshift({
      id: createId("qry"),
      tenantId: currentTenantId,
      brandId,
      brandName: getBrandByIdUnsafe(brandId).name,
      countryCode: payload.countryCode,
      countryName: payload.countryName,
      languageCode: payload.languageCode,
      languageName: payload.languageName,
      keyword,
      status: "pending",
      selected: false,
      score: 0,
      runId: null,
    });
  });
  return simulate(row);
}

export async function addTaskToRun(configRowId: string, runId: string) {
  const configRow = requireValue(brandConfigRows.find((item) => item.id === configRowId), "Task not found");
  const run = requireValue(runs.find((item) => item.id === runId), "Run not found");
  if (configRow.runId) {
    throw new ApiError("Task is already assigned to a run", 400);
  }
  const matchingRows = queryRows.filter(
    (row) =>
      row.brandId === configRow.brandId &&
      row.countryCode === configRow.countryCode &&
      row.languageCode === configRow.languageCode &&
      configRow.keywords.includes(row.keyword),
  );

  matchingRows.forEach((row) => {
    row.runId = runId;
    const existing = runQueryResults.find((item) => item.runId === runId && item.queryRowId === row.id);
    if (!existing) {
      runQueryResults.unshift({
        id: createId("rqr"),
        runId,
        queryRowId: row.id,
        keyword: row.keyword,
        countryCode: row.countryCode,
        countryName: row.countryName,
        languageCode: row.languageCode,
        languageName: row.languageName,
        status: "pending",
        score: 0,
        resultCount: 0,
      });
    }
  });

  configRow.runId = runId;
  configRow.updatedAt = new Date().toISOString();
  if (!run.taskIds.includes(configRow.id)) {
    run.taskIds.push(configRow.id);
  }
  run.totalQueries = runQueryResults.filter((item) => item.runId === runId).length;
  return simulate(run);
}

export async function updateBrandConfigRow(rowId: string, payload: BrandConfigRowFormValues) {
  const row = requireValue(brandConfigRows.find((item) => item.id === rowId), "Configuration row not found");
  Object.assign(row, payload, { updatedAt: new Date().toISOString() });
  return simulate(row);
}

export async function deleteBrandConfigRow(rowId: string) {
  const index = brandConfigRows.findIndex((row) => row.id === rowId);
  if (index < 0) {
    throw new ApiError("Configuration row not found", 404);
  }
  const [removed] = brandConfigRows.splice(index, 1);
  return simulate(removed);
}

export async function saveBrandConfiguration() {
  return simulate({ savedAt: new Date().toISOString() });
}

export async function clearAllData() {
  clearTenantDataCollections();
  return simulate({ success: true });
}

export async function populateDemoData() {
  clearTenantDataCollections();

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString();
  const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString();
  const twelveHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString();
  const readyCreatedAt = new Date(now.getTime() - 1000 * 60 * 45).toISOString();
  const scheduledFor = new Date(now.getTime() + 1000 * 60 * 60 * 18).toISOString();
  const scheduledCreatedAt = new Date(now.getTime() - 1000 * 60 * 10).toISOString();

  type DemoTaskDefinition = {
    configId: string;
    queryId: string;
    brandId: string;
    countryCode: string;
    countryName: string;
    languageCode: string;
    languageName: string;
    geolocation: string;
    keyword: string;
    runId: string | null;
    status: QueryRow["status"];
    score: number;
    selected: boolean;
    createdAt: string;
  };

  type DemoRunDefinition = {
    id: string;
    name: string;
    description: string;
    status: Run["status"];
    createdAt: string;
    executionMode: Run["executionMode"];
    scheduledFor: string | null;
    brandId: string;
    brandName: string;
    startedAt: string;
    finishedAt: string | null;
  };

  type ResultProfile = "mostly_positive" | "mixed" | "mostly_negative";

  const demoBrands: Brand[] = [
    {
      id: "brand_velora",
      tenantId: currentTenantId,
      name: "Velora Skin",
      website: "https://veloraskin.com",
      industry: "Beauty",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    },
    {
      id: "brand_lunoro",
      tenantId: currentTenantId,
      name: "Lunoro Travel",
      website: "https://lunorotravel.com",
      industry: "Travel",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    },
    {
      id: "brand_klyra",
      tenantId: currentTenantId,
      name: "Klyra Home",
      website: "https://klyrahome.com",
      industry: "Home",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
    {
      id: "brand_novu",
      tenantId: currentTenantId,
      name: "Novu Mobile",
      website: "https://novumobile.com",
      industry: "Telecom",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    },
  ];

  const brandNamesById = new Map(demoBrands.map((brand) => [brand.id, brand.name]));

  const taskDefinitions: DemoTaskDefinition[] = [
    {
      configId: "cfg_velora_review",
      queryId: "qry_velora_review",
      brandId: "brand_velora",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Zurich",
      keyword: "velora skin review",
      runId: "run_weekly_reputation",
      status: "done",
      score: 0.64,
      selected: false,
      createdAt: twoDaysAgo,
    },
    {
      configId: "cfg_lunoro_review_ms",
      queryId: "qry_lunoro_review_ms",
      brandId: "brand_lunoro",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "ms",
      languageName: "Malay",
      geolocation: "Kuala Lumpur",
      keyword: "lunoro travel review",
      runId: "run_weekly_reputation",
      status: "done",
      score: 0.38,
      selected: false,
      createdAt: twoDaysAgo,
    },
    {
      configId: "cfg_klyra_legit_de",
      queryId: "qry_klyra_legit_de",
      brandId: "brand_klyra",
      countryCode: "DE",
      countryName: "Germany",
      languageCode: "de",
      languageName: "German",
      geolocation: "Berlin",
      keyword: "klyra home legit",
      runId: "run_weekly_reputation",
      status: "done",
      score: 0.46,
      selected: false,
      createdAt: twoDaysAgo,
    },
    {
      configId: "cfg_novu_review_en",
      queryId: "qry_novu_review_en",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      geolocation: "Mumbai",
      keyword: "novu mobile review",
      runId: "run_market_sentiment",
      status: "done",
      score: 0.29,
      selected: false,
      createdAt: yesterday,
    },
    {
      configId: "cfg_lunoro_complaints_sg",
      queryId: "qry_lunoro_complaints_sg",
      brandId: "brand_lunoro",
      countryCode: "SG",
      countryName: "Singapore",
      languageCode: "en",
      languageName: "English",
      geolocation: "Singapore",
      keyword: "lunoro travel complaints",
      runId: "run_market_sentiment",
      status: "done",
      score: -0.18,
      selected: false,
      createdAt: yesterday,
    },
    {
      configId: "cfg_velora_legit_fr",
      queryId: "qry_velora_legit_fr",
      brandId: "brand_velora",
      countryCode: "FR",
      countryName: "France",
      languageCode: "fr",
      languageName: "French",
      geolocation: "Paris",
      keyword: "velora skin legit",
      runId: "run_market_sentiment",
      status: "done",
      score: 0.22,
      selected: false,
      createdAt: yesterday,
    },
    {
      configId: "cfg_klyra_scam_de",
      queryId: "qry_klyra_scam_de",
      brandId: "brand_klyra",
      countryCode: "DE",
      countryName: "Germany",
      languageCode: "de",
      languageName: "German",
      geolocation: "Munich",
      keyword: "klyra home scam",
      runId: "run_brand_risk_audit",
      status: "done",
      score: -0.54,
      selected: false,
      createdAt: twelveHoursAgo,
    },
    {
      configId: "cfg_novu_scam_hi",
      queryId: "qry_novu_scam_hi",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "hi",
      languageName: "Hindi",
      geolocation: "Delhi",
      keyword: "novu mobile scam",
      runId: "run_brand_risk_audit",
      status: "done",
      score: -0.49,
      selected: false,
      createdAt: twelveHoursAgo,
    },
    {
      configId: "cfg_velora_complaints_uk",
      queryId: "qry_velora_complaints_uk",
      brandId: "brand_velora",
      countryCode: "GB",
      countryName: "United Kingdom",
      languageCode: "en",
      languageName: "English",
      geolocation: "London",
      keyword: "velora skin complaints",
      runId: "run_brand_risk_audit",
      status: "done",
      score: -0.26,
      selected: false,
      createdAt: twelveHoursAgo,
    },
    {
      configId: "cfg_lunoro_scam_en",
      queryId: "qry_lunoro_scam_en",
      brandId: "brand_lunoro",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "en",
      languageName: "English",
      geolocation: "Penang",
      keyword: "lunoro travel scam",
      runId: "run_live_watch",
      status: "searching",
      score: 0,
      selected: false,
      createdAt: scheduledCreatedAt,
    },
    {
      configId: "cfg_klyra_review_ch",
      queryId: "qry_klyra_review_ch",
      brandId: "brand_klyra",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Basel",
      keyword: "klyra home review",
      runId: "run_live_watch",
      status: "searching",
      score: 0,
      selected: false,
      createdAt: readyCreatedAt,
    },
    {
      configId: "cfg_novu_legit_en",
      queryId: "qry_novu_legit_en",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      geolocation: "Bengaluru",
      keyword: "novu mobile legit",
      runId: "run_upcoming_regional_scan",
      status: "pending",
      score: 0,
      selected: false,
      createdAt: scheduledCreatedAt,
    },
    {
      configId: "cfg_velora_before_after",
      queryId: "qry_velora_before_after",
      brandId: "brand_velora",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Geneva",
      keyword: "velora skin before and after",
      runId: null,
      status: "pending",
      score: 0,
      selected: true,
      createdAt: readyCreatedAt,
    },
    {
      configId: "cfg_lunoro_support_th",
      queryId: "qry_lunoro_support_th",
      brandId: "brand_lunoro",
      countryCode: "TH",
      countryName: "Thailand",
      languageCode: "en",
      languageName: "English",
      geolocation: "Bangkok",
      keyword: "lunoro travel support",
      runId: null,
      status: "pending",
      score: 0,
      selected: false,
      createdAt: readyCreatedAt,
    },
    {
      configId: "cfg_novu_warranty_en",
      queryId: "qry_novu_warranty_en",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      geolocation: "Pune",
      keyword: "novu mobile warranty",
      runId: null,
      status: "pending",
      score: 0,
      selected: false,
      createdAt: scheduledCreatedAt,
    },
  ];

  const runDefinitions: DemoRunDefinition[] = [
    {
      id: "run_weekly_reputation",
      name: "Weekly Reputation Scan",
      description: "Cross-brand sweep for priority review queries.",
      status: "completed",
      createdAt: twoDaysAgo,
      executionMode: "now",
      scheduledFor: null,
      brandId: "brand_velora",
      brandName: "3 brands",
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 49).toISOString(),
      finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 47).toISOString(),
    },
    {
      id: "run_market_sentiment",
      name: "Market Sentiment Check",
      description: "Scheduled comparison across Malaysia and India markets.",
      status: "completed",
      createdAt: yesterday,
      executionMode: "now",
      scheduledFor: null,
      brandId: "brand_lunoro",
      brandName: "3 brands",
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 27).toISOString(),
      finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(),
    },
    {
      id: "run_brand_risk_audit",
      name: "Brand Risk Audit",
      description: "Deep scan of scam-related keywords across all regions.",
      status: "completed",
      createdAt: twelveHoursAgo,
      executionMode: "now",
      scheduledFor: null,
      brandId: "brand_klyra",
      brandName: "3 brands",
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 13).toISOString(),
      finishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 11).toISOString(),
    },
    {
      id: "run_live_watch",
      name: "Live Reputation Watch",
      description: "Actively collecting new mentions across high-priority travel and home queries.",
      status: "running",
      createdAt: readyCreatedAt,
      executionMode: "now",
      scheduledFor: null,
      brandId: "brand_lunoro",
      brandName: "2 brands",
      startedAt: readyCreatedAt,
      finishedAt: null,
    },
    {
      id: "run_upcoming_regional_scan",
      name: "Upcoming Regional Scan",
      description: "Queued follow-up coverage for newly configured mobile trust keywords.",
      status: "scheduled",
      createdAt: scheduledCreatedAt,
      executionMode: "scheduled",
      scheduledFor,
      brandId: "brand_novu",
      brandName: "1 brand",
      startedAt: scheduledCreatedAt,
      finishedAt: null,
    },
  ];

  const demoTasks: BrandConfigRow[] = taskDefinitions.map((task) => ({
    id: task.configId,
    brandId: task.brandId,
    countryCode: task.countryCode,
    countryName: task.countryName,
    languageCode: task.languageCode,
    languageName: task.languageName,
    geolocation: task.geolocation,
    keywords: [task.keyword],
    runId: task.runId,
    createdAt: task.createdAt,
    updatedAt: task.createdAt,
  }));

  const demoQueryRows: QueryRow[] = taskDefinitions.map((task) => ({
    id: task.queryId,
    tenantId: currentTenantId,
    brandId: task.brandId,
    brandName: brandNamesById.get(task.brandId) ?? "Unknown brand",
    countryCode: task.countryCode,
    countryName: task.countryName,
    languageCode: task.languageCode,
    languageName: task.languageName,
    keyword: task.keyword,
    status: task.status,
    selected: task.selected,
    score: task.score,
    runId: task.runId,
  }));

  const demoRuns: Run[] = runDefinitions.map((run) => {
    const runTasks = taskDefinitions.filter((task) => task.runId === run.id);
    return {
      id: run.id,
      tenantId: currentTenantId,
      name: run.name,
      description: run.description,
      status: run.status,
      createdAt: run.createdAt,
      executionMode: run.executionMode,
      scheduledFor: run.scheduledFor,
      taskIds: runTasks.map((task) => task.configId),
      brandId: run.brandId,
      brandName: run.brandName,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      totalQueries: runTasks.length,
      completedQueries: runTasks.filter((task) => task.status === "done").length,
      failedQueries: runTasks.filter((task) => task.status === "failed").length,
    };
  });

  const demoRunQueryResults: RunQueryResult[] = taskDefinitions
    .filter((task) => task.runId)
    .map((task) => ({
      id: `rqr_${task.queryId.replace(/^qry_/, "")}`,
      runId: task.runId ?? "",
      queryRowId: task.queryId,
      keyword: task.keyword,
      countryCode: task.countryCode,
      countryName: task.countryName,
      languageCode: task.languageCode,
      languageName: task.languageName,
      status: task.status,
      score: task.score,
      resultCount: task.status === "done" ? 10 : 0,
    }));

  function slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildResultEntries(
    queryRowId: string,
    brandName: string,
    keyword: string,
    countryName: string,
    languageName: string,
    profile: ResultProfile,
    count = 10,
  ): QueryResultUrl[] {
    const baseSlug = slugify(keyword);
    const keywordLead = keyword[0].toUpperCase() + keyword.slice(1);
    const domainSeed = [
      {
        source: "Trustpilot",
        url: `https://www.trustpilot.com/review/${slugify(brandName)}.example`,
        title: `${brandName} reviews and rating snapshot`,
        snippet: `Customer ratings for ${brandName} in ${countryName} show how ${keyword} is trending.`,
      },
      {
        source: "Reddit",
        url: `https://www.reddit.com/r/marketing/comments/${baseSlug}/`,
        title: `What customers are saying about ${keyword}`,
        snippet: `Community threads discuss delivery, support, and whether ${brandName} matches expectations.`,
      },
      {
        source: "Medium",
        url: `https://medium.com/@sentiment-lab/${baseSlug}-${slugify(countryName)}`,
        title: `${keywordLead}: market pulse in ${countryName}`,
        snippet: `A long-form breakdown of search interest and recurring themes for ${brandName}.`,
      },
      {
        source: "LinkedIn",
        url: `https://www.linkedin.com/posts/${slugify(brandName)}_${baseSlug}`,
        title: `${brandName} leadership update on customer feedback`,
        snippet: `The company addresses product quality, service timelines, and ${keyword}.`,
      },
      {
        source: "Consumer Blog",
        url: `https://www.consumerpulse.co/${baseSlug}-${slugify(countryName)}`,
        title: `${brandName} buyer guide: ${keyword}`,
        snippet: `Editorial coverage outlines search sentiment signals and common customer questions.`,
      },
      {
        source: "Tech Forum",
        url: `https://forum.digitalvoice.example/topics/${baseSlug}`,
        title: `${keywordLead} forum roundup`,
        snippet: `Forum users compare alternatives, warranty response, and recent experiences with ${brandName}.`,
      },
      {
        source: "Local News",
        url: `https://news.marketwatcher.example/${slugify(countryName)}/${baseSlug}`,
        title: `${countryName} search chatter around ${brandName}`,
        snippet: `Regional coverage highlights the tone of mentions tied to ${keyword}.`,
      },
      {
        source: "YouTube",
        url: `https://www.youtube.com/watch?v=${slugify(queryRowId).slice(0, 11)}`,
        title: `${brandName} customer review video on ${keyword}`,
        snippet: `Video commentary summarizes product sentiment, complaints, and repeat praise points.`,
      },
      {
        source: "Review Site",
        url: `https://www.sitejabber.com/reviews/${slugify(brandName)}.example`,
        title: `${brandName} review highlights`,
        snippet: `Review-site excerpts surface the strongest praise and criticism around ${keyword}.`,
      },
      {
        source: "Industry News",
        url: `https://insight-journal.example/${slugify(languageName)}/${baseSlug}`,
        title: `${keywordLead} coverage and analyst commentary`,
        snippet: `Analyst-style reporting adds context to how ${brandName} is being discussed online.`,
      },
    ];

    const sentimentByProfile: Record<ResultProfile, Array<{ sentiment: QueryResultUrl["sentiment"]; score: number }>> = {
      mostly_positive: [
        { sentiment: "positive", score: 0.86 },
        { sentiment: "positive", score: 0.74 },
        { sentiment: "positive", score: 0.63 },
        { sentiment: "neutral", score: 0.18 },
        { sentiment: "positive", score: 0.58 },
        { sentiment: "negative", score: -0.28 },
        { sentiment: "positive", score: 0.41 },
        { sentiment: "neutral", score: 0.09 },
        { sentiment: "positive", score: 0.35 },
        { sentiment: "negative", score: -0.12 },
      ],
      mixed: [
        { sentiment: "positive", score: 0.54 },
        { sentiment: "neutral", score: 0.08 },
        { sentiment: "negative", score: -0.34 },
        { sentiment: "positive", score: 0.29 },
        { sentiment: "neutral", score: 0.03 },
        { sentiment: "positive", score: 0.22 },
        { sentiment: "negative", score: -0.19 },
        { sentiment: "positive", score: 0.31 },
        { sentiment: "neutral", score: 0.02 },
        { sentiment: "positive", score: 0.17 },
      ],
      mostly_negative: [
        { sentiment: "negative", score: -0.71 },
        { sentiment: "negative", score: -0.58 },
        { sentiment: "neutral", score: -0.03 },
        { sentiment: "negative", score: -0.42 },
        { sentiment: "positive", score: 0.19 },
        { sentiment: "negative", score: -0.36 },
        { sentiment: "neutral", score: 0.04 },
        { sentiment: "negative", score: -0.27 },
        { sentiment: "positive", score: 0.11 },
        { sentiment: "negative", score: -0.22 },
      ],
    };

    return domainSeed.slice(0, count).map((seed, index) => ({
      id: `url_${queryRowId}_${index + 1}`,
      queryRowId,
      position: index + 1,
      title: seed.title,
      url: seed.url,
      source: seed.source,
      sentiment: sentimentByProfile[profile][index].sentiment,
      score: sentimentByProfile[profile][index].score,
      snippet: seed.snippet,
    }));
  }

  const completedProfiles: Record<string, ResultProfile> = {
    qry_velora_review: "mostly_positive",
    qry_lunoro_review_ms: "mixed",
    qry_klyra_legit_de: "mostly_positive",
    qry_novu_review_en: "mixed",
    qry_lunoro_complaints_sg: "mostly_negative",
    qry_velora_legit_fr: "mixed",
    qry_klyra_scam_de: "mostly_negative",
    qry_novu_scam_hi: "mostly_negative",
    qry_velora_complaints_uk: "mixed",
  };

  const demoQueryResultUrls: QueryResultUrl[] = taskDefinitions.flatMap((task) => {
    const brandName = brandNamesById.get(task.brandId) ?? "Unknown brand";

    if (task.status === "done") {
      return buildResultEntries(
        task.queryId,
        brandName,
        task.keyword,
        task.countryName,
        task.languageName,
        completedProfiles[task.queryId] ?? "mixed",
      );
    }

    if (task.status === "searching") {
      return buildResultEntries(
        task.queryId,
        brandName,
        task.keyword,
        task.countryName,
        task.languageName,
        "mixed",
        3,
      );
    }

    return [];
  });

  replaceCollection(brands, demoBrands);
  replaceCollection(brandConfigRows, demoTasks);
  replaceCollection(queryRows, demoQueryRows);
  replaceCollection(runs, demoRuns);
  replaceCollection(runQueryResults, demoRunQueryResults);
  replaceCollection(queryResultUrls, demoQueryResultUrls);

  return simulate({ success: true });
}

export async function getRuns() {
  return simulate(runs.filter((run) => run.tenantId === currentTenantId));
}

export async function startScheduledRunNow(runId: string) {
  const run = requireValue(runs.find((item) => item.id === runId), "Run not found");
  if (run.status !== "scheduled") {
    throw new ApiError("Run is not scheduled", 400);
  }

  const now = new Date().toISOString();
  run.status = "running";
  run.startedAt = now;
  run.finishedAt = null;

  runQueryResults.forEach((result) => {
    if (result.runId === runId && result.status === "pending") {
      result.status = "searching";
      const queryRow = queryRows.find((row) => row.id === result.queryRowId);
      if (queryRow) {
        queryRow.status = "searching";
      }
    }
  });

  return simulate(run);
}

export async function getAvailableRunTasks(): Promise<RunTaskOption[]> {
  return simulate(
    brandConfigRows
      .filter((row) => !row.runId)
      .map((row) => ({
        id: row.id,
        brandId: row.brandId,
        brandName: getBrandByIdUnsafe(row.brandId).name,
        countryCode: row.countryCode,
        countryName: row.countryName,
        languageCode: row.languageCode,
        languageName: row.languageName,
        geolocation: row.geolocation,
        keywords: row.keywords,
      })),
  );
}

export async function getRunTaskPoolSummary() {
  return simulate({
    totalTasks: brandConfigRows.length,
    availableTasks: brandConfigRows.filter((row) => !row.runId).length,
  });
}

export async function createRun(payload: CreateRunPayload) {
  if (!payload.name.trim()) {
    throw new ApiError("Run name is required", 400);
  }

  if (!payload.taskIds.length) {
    throw new ApiError("Select at least one task", 400);
  }

  const selectedTasks = payload.taskIds.map((taskId) =>
    requireValue(brandConfigRows.find((row) => row.id === taskId), "Task not found"),
  );

  const unavailableTask = selectedTasks.find((task) => task.runId);
  if (unavailableTask) {
    throw new ApiError("One or more tasks are already assigned", 400);
  }

  const brandIds = [...new Set(selectedTasks.map((task) => task.brandId))];
  const firstBrand = getBrandByIdUnsafe(brandIds[0]);
  const runId = createId("run");
  const createdAt = new Date().toISOString();
  const brandName =
    brandIds.length === 1 ? firstBrand.name : `${brandIds.length} brands`;

  const run: Run = {
    id: runId,
    tenantId: currentTenantId,
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    status: payload.executionMode === "scheduled" ? "scheduled" : "running",
    createdAt,
    executionMode: payload.executionMode,
    scheduledFor: payload.scheduledFor,
    taskIds: payload.taskIds,
    brandId: brandIds[0],
    brandName,
    startedAt: createdAt,
    finishedAt: null,
    totalQueries: 0,
    completedQueries: 0,
    failedQueries: 0,
  };

  selectedTasks.forEach((task) => {
    task.runId = runId;
    task.updatedAt = createdAt;
    const matchingRows = queryRows.filter(
      (row) =>
        row.brandId === task.brandId &&
        row.countryCode === task.countryCode &&
        row.languageCode === task.languageCode &&
        task.keywords.includes(row.keyword),
    );

    matchingRows.forEach((row) => {
      row.runId = runId;
      runQueryResults.push({
        id: createId("rqr"),
        runId,
        queryRowId: row.id,
        keyword: row.keyword,
        countryCode: row.countryCode,
        countryName: row.countryName,
        languageCode: row.languageCode,
        languageName: row.languageName,
        status: payload.executionMode === "scheduled" ? "pending" : "searching",
        score: 0,
        resultCount: 0,
      });
    });
  });

  if (payload.executionMode === "now") {
    queryRows.forEach((row) => {
      if (row.runId === runId) {
        row.status = "searching";
      }
    });
  }

  run.totalQueries = runQueryResults.filter((item) => item.runId === runId).length;
  runs.unshift(run);
  return simulate(run);
}

export async function getRunById(id: string) {
  return simulate(requireValue(runs.find((run) => run.id === id), "Run not found"));
}

export async function getRunQueryResults(runId: string) {
  return simulate(
    runQueryResults
      .filter((result) => result.runId === runId)
      .map((result) => ({
        ...result,
        resultCount: result.status === "done" ? 10 : result.status === "failed" ? 0 : result.resultCount,
      })),
  );
}

export async function getRunResultTasks(runId: string): Promise<RunResultTaskGroup[]> {
  const run = requireValue(runs.find((item) => item.id === runId), "Run not found");

  const tasks = runQueryResults
    .filter((result) => result.runId === runId)
    .map((result) => {
      const queryRow = queryRows.find((row) => row.id === result.queryRowId);
      const urls =
        result.status === "done"
          ? ensureTenResultsForQuery(result.queryRowId)
          : queryResultUrls
              .filter((url) => url.queryRowId === result.queryRowId)
              .sort((a, b) => a.position - b.position);

      const summary = urls.reduce(
        (acc, url) => {
          if (url.sentiment === "positive") {
            acc.positive += 1;
          } else if (url.sentiment === "negative") {
            acc.negative += 1;
          } else {
            acc.neutral += 1;
          }

          return acc;
        },
        { positive: 0, negative: 0, neutral: 0 },
      );

      return {
        id: result.queryRowId,
        runId,
        queryRowId: result.queryRowId,
        keyword: result.keyword,
        brandId: queryRow?.brandId ?? run.brandId,
        brandName: queryRow?.brandName ?? run.brandName,
        countryCode: result.countryCode,
        countryName: result.countryName,
        languageCode: result.languageCode,
        languageName: result.languageName,
        status: result.status,
        score: result.score,
        resultCount: result.status === "done" ? 10 : result.resultCount,
        urls,
        summary,
      };
    });

  return simulate(tasks);
}

export async function getRunResultUrls(_runId: string, queryRowId: string) {
  return simulate(ensureTenResultsForQuery(queryRowId));
}

export async function getAccountProfile() {
  return simulate(accountProfile);
}

export async function updateAccountProfile(payload: AccountProfileFormValues) {
  Object.assign(accountProfile, payload);
  return simulate(accountProfile);
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const activeRuns = runs.filter((run) => run.status === "running" || run.status === "queued");
  const systemHealth: SystemHealth = {
    activeRuns: activeRuns.length,
    queueDepth: 11,
    failedTasks24h: queryRows.filter((row) => row.status === "failed").length,
    tokenUsageToday: 182400,
    apiStatus: "healthy",
  };

  return simulate({
    systemHealth,
    activeRuns,
    tokenUsage: [
      { label: "00:00", value: 21000 },
      { label: "06:00", value: 38000 },
      { label: "12:00", value: 76000 },
      { label: "18:00", value: 47400 },
    ],
  });
}

export async function getAdminClients() {
  return simulate(adminClients);
}

export async function getAdminSettings() {
  return simulate(adminSettings);
}

export async function updateAdminSettings(payload: AdminSettings) {
  Object.assign(adminSettings, payload);
  return simulate(adminSettings);
}
