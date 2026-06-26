import { z } from "zod";

export const updateMinutesSchema = z.object({
  meetingId: z.string().uuid("Invalid meeting ID."),
  body: z.string().min(1, "Minutes body cannot be empty."),
});

export type UpdateMinutesInput = z.infer<typeof updateMinutesSchema>;