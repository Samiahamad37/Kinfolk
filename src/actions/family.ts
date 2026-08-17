"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  eventSchema,
  albumSchema,
  photoSchema,
  storySchema,
  documentSchema,
  messageSchema,
  settingsSchema,
} from "@/lib/validators";
import type { ActionState } from "@/actions/auth";

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseIds(raw?: string) {
  if (!raw?.trim()) return [] as string[];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseDateParts(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    const yearMatch = date.match(/(\d{4})/);
    return {
      year: yearMatch ? Number(yearMatch[1]) : null,
      month: null as number | null,
      day: null as number | null,
    };
  }
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export async function createEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = eventSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    date: formData.get("date"),
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
    personIds: formData.get("personIds") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const parts = parseDateParts(parsed.data.date);
  const personIds = parseIds(parsed.data.personIds);

  await prisma.familyEvent.create({
    data: {
      ownerId: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      date: parsed.data.date,
      year: parts.year,
      month: parts.month,
      day: parts.day,
      location: emptyToNull(parsed.data.location),
      description: emptyToNull(parsed.data.description),
      people: {
        create: personIds.map((personId) => ({ personId })),
      },
    },
  });

  revalidatePath("/events");
  revalidatePath("/timeline");
  revalidatePath("/dashboard");
  return { success: "Event created" };
}

export async function deleteEventAction(eventId: string) {
  const user = await requireUser();
  await prisma.familyEvent.deleteMany({ where: { id: eventId, ownerId: user.id } });
  revalidatePath("/events");
  revalidatePath("/timeline");
}

export async function createAlbumAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = albumSchema.safeParse({
    title: formData.get("title"),
    coverUrl: formData.get("coverUrl") || undefined,
    description: formData.get("description") || undefined,
    year: formData.get("year") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.album.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      coverUrl: emptyToNull(parsed.data.coverUrl),
      description: emptyToNull(parsed.data.description),
      year: emptyToNull(parsed.data.year),
    },
  });
  revalidatePath("/photos");
  return { success: "Album created" };
}

export async function createPhotoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = photoSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    albumId: formData.get("albumId") || undefined,
    year: formData.get("year") || undefined,
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
    personIds: formData.get("personIds") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const personIds = parseIds(parsed.data.personIds);
  const year = parsed.data.year ? Number(parsed.data.year) : null;

  await prisma.photo.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      url: parsed.data.url,
      albumId: emptyToNull(parsed.data.albumId),
      year: Number.isFinite(year) ? year : null,
      location: emptyToNull(parsed.data.location),
      description: emptyToNull(parsed.data.description),
      people: { create: personIds.map((personId) => ({ personId })) },
    },
  });
  revalidatePath("/photos");
  return { success: "Photo added" };
}

export async function createStoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = storySchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    date: formData.get("date") || undefined,
    tags: formData.get("tags") || undefined,
    authorId: formData.get("authorId") || undefined,
    personIds: formData.get("personIds") || undefined,
    readTime: formData.get("readTime") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const tags = parseIds(parsed.data.tags?.replace(/,/g, ",") || "")
    .length
    ? JSON.stringify(parseIds(parsed.data.tags))
    : JSON.stringify(
        (parsed.data.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      );
  const personIds = parseIds(parsed.data.personIds);
  const readTime = parsed.data.readTime ? Number(parsed.data.readTime) : 3;

  await prisma.story.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      date: emptyToNull(parsed.data.date),
      tags,
      readTime: Number.isFinite(readTime) ? readTime : 3,
      authorId: emptyToNull(parsed.data.authorId),
      people: { create: personIds.map((personId) => ({ personId })) },
    },
  });
  revalidatePath("/stories");
  return { success: "Story published" };
}

export async function createDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = documentSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    year: formData.get("year") || undefined,
    fileSize: formData.get("fileSize") || undefined,
    url: formData.get("url") || undefined,
    description: formData.get("description") || undefined,
    personIds: formData.get("personIds") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const personIds = parseIds(parsed.data.personIds);
  const year = parsed.data.year ? Number(parsed.data.year) : null;

  await prisma.familyDocument.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      year: Number.isFinite(year) ? year : null,
      fileSize: emptyToNull(parsed.data.fileSize),
      url: emptyToNull(parsed.data.url),
      description: emptyToNull(parsed.data.description),
      people: { create: personIds.map((personId) => ({ personId })) },
    },
  });
  revalidatePath("/documents");
  revalidatePath("/records");
  return { success: "Document added" };
}

export async function createMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = messageSchema.safeParse({
    senderName: formData.get("senderName"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.message.create({
    data: {
      ownerId: user.id,
      senderName: parsed.data.senderName,
      body: parsed.data.body,
    },
  });
  revalidatePath("/messages");
  return { success: "Message sent" };
}

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    theme: formData.get("theme") || undefined,
    language: formData.get("language") || undefined,
    notifyBirthdays: formData.get("notifyBirthdays") || undefined,
    notifyAnniversaries: formData.get("notifyAnniversaries") || undefined,
    notifyStories: formData.get("notifyStories") || undefined,
    notifyMessages: formData.get("notifyMessages") || undefined,
    profilePrivacy: formData.get("profilePrivacy") || undefined,
    treePrivacy: formData.get("treePrivacy") || undefined,
    photosPrivacy: formData.get("photosPrivacy") || undefined,
    documentsPrivacy: formData.get("documentsPrivacy") || undefined,
    storiesPrivacy: formData.get("storiesPrivacy") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const bool = (v?: string) => v === "on" || v === "true";

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      theme: parsed.data.theme ?? "light",
      language: parsed.data.language ?? "en",
      notifyBirthdays: bool(parsed.data.notifyBirthdays),
      notifyAnniversaries: bool(parsed.data.notifyAnniversaries),
      notifyStories: bool(parsed.data.notifyStories),
      notifyMessages: bool(parsed.data.notifyMessages),
      profilePrivacy: parsed.data.profilePrivacy ?? "family",
      treePrivacy: parsed.data.treePrivacy ?? "family",
      photosPrivacy: parsed.data.photosPrivacy ?? "family",
      documentsPrivacy: parsed.data.documentsPrivacy ?? "close-family",
      storiesPrivacy: parsed.data.storiesPrivacy ?? "family",
    },
    update: {
      theme: parsed.data.theme,
      language: parsed.data.language,
      notifyBirthdays: parsed.data.notifyBirthdays !== undefined ? bool(parsed.data.notifyBirthdays) : undefined,
      notifyAnniversaries:
        parsed.data.notifyAnniversaries !== undefined ? bool(parsed.data.notifyAnniversaries) : undefined,
      notifyStories: parsed.data.notifyStories !== undefined ? bool(parsed.data.notifyStories) : undefined,
      notifyMessages: parsed.data.notifyMessages !== undefined ? bool(parsed.data.notifyMessages) : undefined,
      profilePrivacy: parsed.data.profilePrivacy,
      treePrivacy: parsed.data.treePrivacy,
      photosPrivacy: parsed.data.photosPrivacy,
      documentsPrivacy: parsed.data.documentsPrivacy,
      storiesPrivacy: parsed.data.storiesPrivacy,
    },
  });

  revalidatePath("/settings");
  return { success: "Settings saved" };
}
