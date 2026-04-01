import { z } from "zod";

export const accountProfileSchema = z.object({
  workspaceName: z.string().min(2, "Workspace name is required"),
  companyName: z.string().min(2, "Company name is required"),
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email"),
});

export type AccountProfileSchema = z.infer<typeof accountProfileSchema>;
