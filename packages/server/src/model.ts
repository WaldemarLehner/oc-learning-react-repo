import { z } from 'zod';

export const EntryZod = z.object({
  id: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  projectId: z.string().uuid(),
  breakDurationMinutes: z.number().min(0).optional(),
  description: z.string().min(1),
});

export type Entry = z.infer<typeof EntryZod>;

export const ProjectZod = z.object({
  id: z.string().uuid(),
  customerName: z.string(),
  projectName: z.string(),
});

export type Project = z.infer<typeof ProjectZod>;
