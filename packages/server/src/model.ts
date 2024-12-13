import { z } from 'zod';

export const EntryZod = z.object({
  id: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  projectId: z.string().uuid(),
  breakDurationMinutes: z.number().min(0).int(),
  description: z.string().min(1),
});

export type Entry = z.infer<typeof EntryZod>;

export const NewEntryZod = EntryZod.omit({ id: true });
export type NewEntry = z.infer<typeof NewEntryZod>;

export const PatchEntryZod = EntryZod.pick({
  from: true,
  to: true,
  breakDurationMinutes: true,
  description: true,
})
  .partial()
  .refine(
    (vals) => Object.values(vals).some((e) => e !== undefined && e !== null),
    'at least field must be set',
  );

export type PatchEntry = z.infer<typeof PatchEntryZod>;

export const ProjectZod = z.object({
  id: z.string().uuid(),
  customerName: z.string(),
  projectName: z.string(),
});

export type Project = z.infer<typeof ProjectZod>;

export const RichEntryZod = EntryZod.merge(ProjectZod.omit({ id: true }));
export type RichEntry = z.infer<typeof RichEntryZod>;
