import { z } from "zod";

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Veuillez entrer une adresse email valide")
    .regex(/@taqa\.ma$/, "Seules les adresses email @taqa.ma sont autorisées"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .optional(),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "Veuillez confirmer votre nouveau mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Veuillez entrer une adresse email valide")
    .regex(/@taqa\.ma$/, "Seules les adresses email @taqa.ma sont autorisées"),
  reason: z
    .string()
    .min(10, "Veuillez décrire la raison de votre demande (minimum 10 caractères)")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  requestedBy: z
    .string()
    .min(2, "Veuillez entrer votre nom complet")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
});

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Veuillez entrer une adresse email valide")
    .regex(/@taqa\.ma$/, "Seules les adresses email @taqa.ma sont autorisées"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  role: z.enum(["admin", "manager", "technician"], {
    errorMap: () => ({ message: "Veuillez sélectionner un rôle valide" }),
  }),
  department: z
    .string()
    .optional(),
  temporaryPassword: z
    .string()
    .min(8, "Le mot de passe temporaire doit contenir au moins 8 caractères"),
});

// Type exports for components
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>; 