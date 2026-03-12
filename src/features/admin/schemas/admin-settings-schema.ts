import { z } from "zod";

export const adminSettingsSchema = z.object({
  ignoredDomains: z.string().min(1, "Provide at least one domain"),
  concurrencyLimit: z.number().min(1).max(100),
  runTimeoutSec: z.number().min(60).max(3600),
  retryLimit: z.number().min(0).max(10),
});

export type AdminSettingsSchema = z.infer<typeof adminSettingsSchema>;
