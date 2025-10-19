import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY: z.string().min(10),
  DATABASE_URL: z.string().min(10),
  GOOGLE_MAPS_SERVER_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAP_ID: z.string().optional(),
});

export const ENV = EnvSchema.parse(process.env);
