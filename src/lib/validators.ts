import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_.-]+$/, "Username can use letters, numbers, dots, dashes, and underscores"),
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const memberSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_.-]+$/, "Username can use letters, numbers, dots, dashes, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  education: z.string().trim().optional(),
  biography: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  privacy: z.string().trim().optional(),
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

export const eventSchema = z.object({
  type: z.string().trim().min(1),
  title: z.string().trim().min(1, "Title is required"),
  date: z.string().trim().min(1, "Date is required"),
  location: z.string().trim().optional(),
  description: z.string().trim().optional(),
  personIds: z.string().optional(),
});

export const albumSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  coverUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  year: z.string().trim().optional(),
});

export const photoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  url: z.string().trim().url("Valid image URL required"),
  albumId: z.string().optional(),
  year: z.string().optional(),
  location: z.string().trim().optional(),
  description: z.string().trim().optional(),
  personIds: z.string().optional(),
});

export const storySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  content: z.string().trim().min(1, "Content is required"),
  date: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  authorId: z.string().optional(),
  personIds: z.string().optional(),
  readTime: z.string().optional(),
});

export const documentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  type: z.string().trim().min(1),
  year: z.string().optional(),
  fileSize: z.string().trim().optional(),
  url: z.string().trim().optional(),
  description: z.string().trim().optional(),
  personIds: z.string().optional(),
});

export const messageSchema = z.object({
  senderName: z.string().trim().min(1, "Name is required"),
  body: z.string().trim().min(1, "Message is required"),
});

export const settingsSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  notifyBirthdays: z.string().optional(),
  notifyAnniversaries: z.string().optional(),
  notifyStories: z.string().optional(),
  notifyMessages: z.string().optional(),
  profilePrivacy: z.string().optional(),
  treePrivacy: z.string().optional(),
  photosPrivacy: z.string().optional(),
  documentsPrivacy: z.string().optional(),
  storiesPrivacy: z.string().optional(),
});
