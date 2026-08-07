import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, { error: "Password is required." })
    .max(128, { error: "Password is too long." }),
});

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(80, { error: "Name must be at most 80 characters." })
    .trim(),
  email: z.email({ error: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .max(128, { error: "Password must be at most 128 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
    .regex(/[0-9]/, { error: "Password must contain a number." }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z
  .object({
    email: z.email({ error: "Please enter a valid email address." }),
    code: z
      .string()
      .regex(/^\d{6}$/, { error: "Enter the 6-digit code from your email." }),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters." })
      .max(128, { error: "Password must be at most 128 characters." })
      .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
      .regex(/[0-9]/, { error: "Password must contain a number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
