import { mockRequest } from "@/lib/api/client";
import { getRunById, getRunQueryResults, getRunResultUrls, getRuns, runSelectedQueries } from "@/lib/api/mock-db";

export const runsApi = {
  getRuns: () => mockRequest(() => getRuns()),
  getRunById: (id: string) => mockRequest(() => getRunById(id)),
  getRunQueryResults: (runId: string) => mockRequest(() => getRunQueryResults(runId)),
  getRunResultUrls: (runId: string, queryRowId: string) =>
    mockRequest(() => getRunResultUrls(runId, queryRowId)),
  rerun: (brandId: string) => mockRequest(() => runSelectedQueries(brandId)),
};
