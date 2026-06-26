import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title must be under 200 characters."),
  description: z.string().max(2000, "Description must be under 2000 characters.").optional(),
  location: z.string().max(300, "Location must be under 300 characters.").optional(),
  scheduledAt: z.string().datetime({ message: "Please select a valid date and time." }),
  durationMin: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes.")
    .max(480, "Duration must be under 480 minutes (8 hours)."),
});

export const updateMeetingSchema = createMeetingSchema.partial().extend({
  scheduledAt: z
    .string()
    .datetime({ message: "Please select a valid date and time." })
    .optional(),
});

export const carryOverSchema = z.object({
  meetingId: z.string().uuid("Invalid meeting ID."),
  itemIds: z.array(z.string().uuid("Invalid item ID.")).min(1, "Select at least one item to carry over."),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type CarryOverInput = z.infer<typeof carryOverSchema>;