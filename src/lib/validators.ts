import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

export const personSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.string().trim().optional(),
  birthDate: z.string().trim().optional(),
  deathDate: z.string().trim().optional(),
  birthPlace: z.string().trim().optional(),
  deathPlace: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  biography: z.string().trim().optional(),
});

export const relationshipSchema = z.object({
  fromPersonId: z.string().min(1),
  toPersonId: z.string().min(1),
  type: z.enum(["PARENT", "SPOUSE"]),
  notes: z.string().trim().optional(),
});

export const recordSchema = z.object({
  personId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  recordType: z.string().trim().min(1, "Record type is required"),
  description: z.string().trim().optional(),
  eventDate: z.string().trim().optional(),
  location: z.string().trim().optional(),
});
