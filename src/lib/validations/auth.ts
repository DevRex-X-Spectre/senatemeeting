import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Staff ID or email is required.").max(160, "Login ID is too long."),
  password: z.string().min(1, "Password is required."),
});

export const createMemberCredentialsSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name must be under 120 characters."),
  staffId: z
    .string()
    .min(5, "Staff ID must include the NAUB prefix and an identifier.")
    .max(40, "Staff ID must be under 40 characters.")
    .regex(/^NAUB[-_.]?[a-zA-Z0-9][a-zA-Z0-9._-]*$/i, "Staff ID must start with NAUB and include an identifier."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be under 72 characters."),
  title: z.string().max(200, "Title must be under 200 characters.").optional(),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name must be under 120 characters."),
  title: z.string().max(200, "Title must be under 200 characters.").optional(),
  avatarUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "New password must be under 72 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMemberCredentialsInput = z.infer<typeof createMemberCredentialsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
