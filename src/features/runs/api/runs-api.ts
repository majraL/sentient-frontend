import { mockRequest } from "@/lib/api/client";
import {
  createRun,
  getAvailableRunTasks,
  getRunById,
  getRunQueryResults,
  getRunResultUrls,
  getRunTaskPoolSummary,
  getRuns,
  runReadyRun,
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
  getRunResultUrls: (runId: string, queryRowId: string) =>
    mockRequest(() => getRunResultUrls(runId, queryRowId)),
  startNow: (runId: string) => mockRequest(() => startScheduledRunNow(runId)),
  run: (runId: string) => mockRequest(() => runReadyRun(runId)),
  rerun: (brandId: string) => mockRequest(() => runSelectedQueries(brandId)),
};
