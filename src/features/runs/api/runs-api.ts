import { mockRequest } from "@/lib/api/client";
import {
  createRun,
  getAvailableRunTasks,
  getRunById,
  getRunQueryResults,
  getRunResultTasks,
  getRunResultUrls,
  getRunTaskPoolSummary,
  getRuns,
  runSelectedQueries,
  startScheduledRunNow,
} from "@/lib/api/mock-db";
import type { CreateRunPayload } from "@/types/api";

export const runsApi = {
  getRuns: () => mockRequest(() => getRuns()),
  getAvailableTasks: () => mockRequest(() => getAvailableRunTasks()),
  getTaskPoolSummary: () => mockRequest(() => getRunTaskPoolSummary()),
  createRun: (payload: CreateRunPayload) => mockRequest(() => createRun(payload)),
  getRunById: (id: string) => mockRequest(() => getRunById(id)),
  getRunQueryResults: (runId: string) => mockRequest(() => getRunQueryResults(runId)),
  getRunResultTasks: (runId: string) => mockRequest(() => getRunResultTasks(runId)),
  getRunResultUrls: (runId: string, queryRowId: string) =>
    mockRequest(() => getRunResultUrls(runId, queryRowId)),
  startNow: (runId: string) => mockRequest(() => startScheduledRunNow(runId)),
  rerun: (brandId: string) => mockRequest(() => runSelectedQueries(brandId)),
};
