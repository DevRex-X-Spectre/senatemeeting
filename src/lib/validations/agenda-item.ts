import { z } from "zod";
import type { ItemStatus } from "@/types/domain";

export const createAgendaItemSchema = z.object({
  meetingId: z.string().uuid("Invalid meeting ID."),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title must be under 200 characters."),
  description: z.string().max(2000, "Description must be under 2000 characters.").optional(),
  allocatedMin: z
    .number()
    .int()
    .min(1, "Allocated time must be at least 1 minute.")
    .max(240, "Allocated time must be under 240 minutes."),
  orderIndex: z.number().int().min(0),
});

export const reorderAgendaItemsSchema = z.object({
  meetingId: z.string().uuid("Invalid meeting ID."),
  orderedIds: z.array(z.string().uuid()).min(1, "Items list cannot be empty."),
});

export const updateItemStatusSchema = z.object({
  itemId: z.string().uuid("Invalid item ID."),
  status: z.enum(["pending", "in_progress", "resolved", "deferred", "tabled"] satisfies [ItemStatus, ...ItemStatus[]]),
  outcomeNotes: z.string().max(2000).optional(),
});

export const closeItemSchema = z.object({
  itemId: z.string().uuid("Invalid item ID."),
  status: z.enum(["resolved", "deferred", "tabled"] satisfies [ItemStatus, ...ItemStatus[]]),
  outcomeNotes: z.string().max(2000).optional(),
});

export type CreateAgendaItemInput = z.infer<typeof createAgendaItemSchema>;
export type ReorderAgendaItemsInput = z.infer<typeof reorderAgendaItemsSchema>;
export type UpdateItemStatusInput = z.infer<typeof updateItemStatusSchema>;
export type CloseItemInput = z.infer<typeof closeItemSchema>;