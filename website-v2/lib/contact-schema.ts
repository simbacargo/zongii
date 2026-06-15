import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "name"),
  company: z.string().trim().optional().default(""),
  phone: z.string().trim().min(6, "phone"),
  email: z.string().trim().email("email").optional().or(z.literal("")),
  message: z.string().trim().min(10, "message"),
  // Honeypot — must stay empty.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
