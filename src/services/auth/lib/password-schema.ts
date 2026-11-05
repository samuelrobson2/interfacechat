import { z } from "zod";

export const PASSWORD_REQUIREMENTS = {
  min_length: "At least 8 characters long",
  uppercase: "At least one uppercase letter",
  lowercase: "At least one lowercase letter",
  number: "At least one number",
  special: "At least one special character",
};

export const passwordSchema = z
  .string()
  .nonempty("Password is required")
  .min(8, PASSWORD_REQUIREMENTS.min_length)
  .regex(/[A-Z]/, PASSWORD_REQUIREMENTS.uppercase)
  .regex(/[a-z]/, PASSWORD_REQUIREMENTS.lowercase)
  .regex(/\d/, PASSWORD_REQUIREMENTS.number)
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, PASSWORD_REQUIREMENTS.special);
