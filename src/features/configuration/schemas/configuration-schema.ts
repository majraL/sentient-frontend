import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required"),
  website: z.url("Enter a valid URL"),
  industry: z.string().min(2, "Industry is required"),
});

export const configRowSchema = z.object({
  countryCode: z.string().min(2, "Required"),
  countryName: z.string().min(2, "Required"),
  languageCode: z.string().min(2, "Required"),
  languageName: z.string().min(2, "Required"),
  geolocation: z.string().nullable(),
  keywords: z.array(z.string().min(2)).min(1, "At least one keyword is required"),
});

export type BrandSchema = z.infer<typeof brandSchema>;
export type ConfigRowSchema = z.infer<typeof configRowSchema>;
