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
  LoginPayload,
  Run,
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

export async function getRuns() {
  return simulate(runs.filter((run) => run.tenantId === currentTenantId));
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
