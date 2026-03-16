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
  const readyCreatedAt = new Date(now.getTime() - 1000 * 60 * 45).toISOString();
  const scheduledFor = new Date(now.getTime() + 1000 * 60 * 60 * 18).toISOString();
  const scheduledCreatedAt = new Date(now.getTime() - 1000 * 60 * 10).toISOString();

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

  const demoTasks: BrandConfigRow[] = [
    {
      id: "cfg_velora_name",
      brandId: "brand_velora",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Zurich",
      keywords: ["velora skin"],
      runId: null,
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_velora_review",
      brandId: "brand_velora",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Zurich",
      keywords: ["velora skin review"],
      runId: "run_weekly_reputation",
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_velora_scam",
      brandId: "brand_velora",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Geneva",
      keywords: ["velora skin scam"],
      runId: null,
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_lunoro_name",
      brandId: "brand_lunoro",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "ms",
      languageName: "Malay",
      geolocation: "Kuala Lumpur",
      keywords: ["lunoro travel"],
      runId: "run_weekly_reputation",
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_lunoro_review",
      brandId: "brand_lunoro",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "en",
      languageName: "English",
      geolocation: "Kuala Lumpur",
      keywords: ["lunoro travel review"],
      runId: null,
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_lunoro_scam",
      brandId: "brand_lunoro",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "en",
      languageName: "English",
      geolocation: "Penang",
      keywords: ["lunoro travel scam"],
      runId: "run_market_sentiment",
      createdAt: scheduledCreatedAt,
      updatedAt: scheduledCreatedAt,
    },
    {
      id: "cfg_klyra_name",
      brandId: "brand_klyra",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Basel",
      keywords: ["klyra home"],
      runId: null,
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_klyra_review",
      brandId: "brand_klyra",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Basel",
      keywords: ["klyra home review"],
      runId: "run_weekly_reputation",
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_klyra_scam",
      brandId: "brand_klyra",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "Bern",
      keywords: ["klyra home scam"],
      runId: null,
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_novu_name",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      geolocation: "Mumbai",
      keywords: ["novu mobile"],
      runId: "run_weekly_reputation",
      createdAt: readyCreatedAt,
      updatedAt: readyCreatedAt,
    },
    {
      id: "cfg_novu_review",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      geolocation: "Mumbai",
      keywords: ["novu mobile review"],
      runId: "run_market_sentiment",
      createdAt: scheduledCreatedAt,
      updatedAt: scheduledCreatedAt,
    },
    {
      id: "cfg_novu_scam",
      brandId: "brand_novu",
      countryCode: "IN",
      countryName: "India",
      languageCode: "hi",
      languageName: "Hindi",
      geolocation: "Delhi",
      keywords: ["novu mobile scam"],
      runId: null,
      createdAt: scheduledCreatedAt,
      updatedAt: scheduledCreatedAt,
    },
  ];

  const demoQueryRows: QueryRow[] = [
    {
      id: "qry_velora_name",
      tenantId: currentTenantId,
      brandId: "brand_velora",
      brandName: "Velora Skin",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      keyword: "velora skin",
      status: "done",
      selected: true,
      score: 0.74,
      runId: null,
    },
    {
      id: "qry_velora_review",
      tenantId: currentTenantId,
      brandId: "brand_velora",
      brandName: "Velora Skin",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      keyword: "velora skin review",
      status: "pending",
      selected: false,
      score: 0,
      runId: "run_weekly_reputation",
    },
    {
      id: "qry_velora_scam",
      tenantId: currentTenantId,
      brandId: "brand_velora",
      brandName: "Velora Skin",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      keyword: "velora skin scam",
      status: "pending",
      selected: true,
      score: 0,
      runId: null,
    },
    {
      id: "qry_lunoro_name",
      tenantId: currentTenantId,
      brandId: "brand_lunoro",
      brandName: "Lunoro Travel",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "ms",
      languageName: "Malay",
      keyword: "lunoro travel",
      status: "pending",
      selected: false,
      score: 0,
      runId: "run_weekly_reputation",
    },
    {
      id: "qry_lunoro_review",
      tenantId: currentTenantId,
      brandId: "brand_lunoro",
      brandName: "Lunoro Travel",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "en",
      languageName: "English",
      keyword: "lunoro travel review",
      status: "done",
      selected: true,
      score: -0.22,
      runId: null,
    },
    {
      id: "qry_lunoro_scam",
      tenantId: currentTenantId,
      brandId: "brand_lunoro",
      brandName: "Lunoro Travel",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "en",
      languageName: "English",
      keyword: "lunoro travel scam",
      status: "pending",
      selected: false,
      score: 0,
      runId: "run_market_sentiment",
    },
    {
      id: "qry_klyra_name",
      tenantId: currentTenantId,
      brandId: "brand_klyra",
      brandName: "Klyra Home",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      keyword: "klyra home",
      status: "pending",
      selected: false,
      score: 0,
      runId: null,
    },
    {
      id: "qry_klyra_review",
      tenantId: currentTenantId,
      brandId: "brand_klyra",
      brandName: "Klyra Home",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      keyword: "klyra home review",
      status: "pending",
      selected: false,
      score: 0,
      runId: "run_weekly_reputation",
    },
    {
      id: "qry_klyra_scam",
      tenantId: currentTenantId,
      brandId: "brand_klyra",
      brandName: "Klyra Home",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      keyword: "klyra home scam",
      status: "pending",
      selected: true,
      score: 0,
      runId: null,
    },
    {
      id: "qry_novu_name",
      tenantId: currentTenantId,
      brandId: "brand_novu",
      brandName: "Novu Mobile",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      keyword: "novu mobile",
      status: "pending",
      selected: false,
      score: 0,
      runId: "run_weekly_reputation",
    },
    {
      id: "qry_novu_review",
      tenantId: currentTenantId,
      brandId: "brand_novu",
      brandName: "Novu Mobile",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      keyword: "novu mobile review",
      status: "pending",
      selected: false,
      score: 0,
      runId: "run_market_sentiment",
    },
    {
      id: "qry_novu_scam",
      tenantId: currentTenantId,
      brandId: "brand_novu",
      brandName: "Novu Mobile",
      countryCode: "IN",
      countryName: "India",
      languageCode: "hi",
      languageName: "Hindi",
      keyword: "novu mobile scam",
      status: "done",
      selected: true,
      score: -0.31,
      runId: null,
    },
  ];

  const demoRuns: Run[] = [
    {
      id: "run_weekly_reputation",
      tenantId: currentTenantId,
      name: "Weekly Reputation Scan",
      description: "Cross-brand sweep for priority review queries.",
      status: "ready",
      createdAt: readyCreatedAt,
      executionMode: "now",
      scheduledFor: null,
      taskIds: ["cfg_velora_review", "cfg_lunoro_name", "cfg_klyra_review", "cfg_novu_name"],
      brandId: "brand_velora",
      brandName: "4 brands",
      startedAt: readyCreatedAt,
      finishedAt: null,
      totalQueries: 4,
      completedQueries: 0,
      failedQueries: 0,
    },
    {
      id: "run_market_sentiment",
      tenantId: currentTenantId,
      name: "Market Sentiment Check",
      description: "Scheduled comparison across Malaysia and India markets.",
      status: "scheduled",
      createdAt: scheduledCreatedAt,
      executionMode: "scheduled",
      scheduledFor,
      taskIds: ["cfg_lunoro_scam", "cfg_novu_review"],
      brandId: "brand_lunoro",
      brandName: "2 brands",
      startedAt: scheduledCreatedAt,
      finishedAt: null,
      totalQueries: 2,
      completedQueries: 0,
      failedQueries: 0,
    },
  ];

  const demoRunQueryResults: RunQueryResult[] = [
    {
      id: "rqr_velora_review",
      runId: "run_weekly_reputation",
      queryRowId: "qry_velora_review",
      keyword: "velora skin review",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      status: "pending",
      score: 0,
      resultCount: 0,
    },
    {
      id: "rqr_lunoro_name",
      runId: "run_weekly_reputation",
      queryRowId: "qry_lunoro_name",
      keyword: "lunoro travel",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "ms",
      languageName: "Malay",
      status: "pending",
      score: 0,
      resultCount: 0,
    },
    {
      id: "rqr_klyra_review",
      runId: "run_weekly_reputation",
      queryRowId: "qry_klyra_review",
      keyword: "klyra home review",
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      status: "pending",
      score: 0,
      resultCount: 0,
    },
    {
      id: "rqr_novu_name",
      runId: "run_weekly_reputation",
      queryRowId: "qry_novu_name",
      keyword: "novu mobile",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      status: "pending",
      score: 0,
      resultCount: 0,
    },
    {
      id: "rqr_lunoro_scam",
      runId: "run_market_sentiment",
      queryRowId: "qry_lunoro_scam",
      keyword: "lunoro travel scam",
      countryCode: "MY",
      countryName: "Malaysia",
      languageCode: "en",
      languageName: "English",
      status: "pending",
      score: 0,
      resultCount: 0,
    },
    {
      id: "rqr_novu_review",
      runId: "run_market_sentiment",
      queryRowId: "qry_novu_review",
      keyword: "novu mobile review",
      countryCode: "IN",
      countryName: "India",
      languageCode: "en",
      languageName: "English",
      status: "pending",
      score: 0,
      resultCount: 0,
    },
  ];

  const demoQueryResultUrls: QueryResultUrl[] = [
    {
      id: "url_velora_1",
      queryRowId: "qry_velora_name",
      position: 1,
      title: "Velora Skin review roundup from Zurich",
      url: "https://search.sentient.example/qry_velora_name/1",
      source: "Review Site",
      sentiment: "positive",
      score: 0.81,
      snippet: "Customer feedback highlights delivery speed and steady product quality.",
    },
    {
      id: "url_velora_2",
      queryRowId: "qry_velora_name",
      position: 2,
      title: "Velora Skin customer sentiment overview",
      url: "https://search.sentient.example/qry_velora_name/2",
      source: "Blog",
      sentiment: "positive",
      score: 0.69,
      snippet: "Search coverage shows a favorable mix of mentions around ingredients and support.",
    },
    {
      id: "url_lunoro_1",
      queryRowId: "qry_lunoro_review",
      position: 1,
      title: "Lunoro Travel review complaints in Malaysia",
      url: "https://search.sentient.example/qry_lunoro_review/1",
      source: "Forum",
      sentiment: "negative",
      score: -0.24,
      snippet: "Recent posts focus on refund timing and baggage durability concerns.",
    },
    {
      id: "url_lunoro_2",
      queryRowId: "qry_lunoro_review",
      position: 2,
      title: "Lunoro Travel social chatter snapshot",
      url: "https://search.sentient.example/qry_lunoro_review/2",
      source: "Community",
      sentiment: "neutral",
      score: -0.04,
      snippet: "Mixed discussion continues, with more scrutiny around customer response times.",
    },
    {
      id: "url_novu_1",
      queryRowId: "qry_novu_scam",
      position: 1,
      title: "Novu Mobile scam warning threads",
      url: "https://search.sentient.example/qry_novu_scam/1",
      source: "Reddit",
      sentiment: "negative",
      score: -0.36,
      snippet: "Multiple discussion threads question warranty handling in Delhi.",
    },
    {
      id: "url_novu_2",
      queryRowId: "qry_novu_scam",
      position: 2,
      title: "Novu Mobile Hindi review digest",
      url: "https://search.sentient.example/qry_novu_scam/2",
      source: "YouTube",
      sentiment: "negative",
      score: -0.28,
      snippet: "Video sentiment trends negative, with repair delays mentioned most often.",
    },
  ];

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

  run.status = "ready";
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
    status: payload.executionMode === "scheduled" ? "scheduled" : "ready",
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
        status: "pending",
        score: 0,
        resultCount: 0,
      });
    });
  });

  run.totalQueries = runQueryResults.filter((item) => item.runId === runId).length;
  runs.unshift(run);
  return simulate(run);
}

export async function runReadyRun(runId: string) {
  const run = requireValue(runs.find((item) => item.id === runId), "Run not found");
  if (run.status !== "ready") {
    throw new ApiError("Run is not ready", 400);
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
