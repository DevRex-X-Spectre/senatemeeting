import { z } from "zod";
import type { VoteChoice } from "@/types/domain";

export const raiseMotionSchema = z.object({
  agendaItemId: z.string().uuid("Invalid agenda item ID."),
  text: z
    .string()
    .min(5, "Motion text must be at least 5 characters.")
    .max(500, "Motion text must be under 500 characters."),
});

export const voteSchema = z.object({
  motionId: z.string().uuid("Invalid motion ID."),
  choice: z.enum(["yes", "no", "abstain"] satisfies [VoteChoice, ...VoteChoice[]]),
});

export const decideMotionSchema = z.object({
  motionId: z.string().uuid("Invalid motion ID."),
  outcome: z.enum(["passed", "rejected"]),
});

export type RaiseMotionInput = z.infer<typeof raiseMotionSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type DecideMotionInput = z.infer<typeof decideMotionSchema>;