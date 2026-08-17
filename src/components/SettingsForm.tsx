"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Bell, Palette, Shield, User } from "lucide-react";
import type { ActionState } from "@/actions/auth";
import { updateSettingsAction } from "@/actions/family";
import { SubmitButton } from "@/components/SubmitButton";

type SettingsLite = {
  theme: string;
  language: string;
  notifyBirthdays: boolean;
  notifyAnniversaries: boolean;
  notifyStories: boolean;
  notifyMessages: boolean;
  profilePrivacy: string;
  treePrivacy: string;
  photosPrivacy: string;
  documentsPrivacy: string;
  storiesPrivacy: string;
};

const initialState: ActionState = {};

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "family", label: "Family only" },
  { value: "close-family", label: "Close family" },
  { value: "private", label: "Private" },
];

const selectClass =
  "rounded-lg border border-[var(--line)] bg-[var(--cream-100)] px-3 py-2 text-xs text-[var(--ink)] outline-none";

async function saveSettingsAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  for (const name of [
    "notifyBirthdays",
    "notifyAnniversaries",
    "notifyStories",
    "notifyMessages",
  ]) {
    if (!formData.get(name)) formData.set(name, "off");
  }
  return updateSettingsAction(prev, formData);
}

export function SettingsForm({
  settings,
  userName,
}: {
  settings: SettingsLite;
  userName: string;
}) {
  const [state, formAction] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-[var(--ink)]">Settings</h1>
        <p className="mt-0.5 text-[13px] text-[var(--muted)]">
          Privacy, notifications, and appearance for your family workspace
        </p>
      </div>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <User size={16} className="text-[var(--accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Profile</h2>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Signed in as <span className="font-medium text-[var(--ink)]">{userName}</span>. Edit
          personal biography and life details from{" "}
          <Link href="/people" className="font-medium text-[var(--accent-deep)] hover:underline">
            Family Members
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[var(--accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Privacy</h2>
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          Control who can see different parts of your family tree. Living members have stronger
          privacy protections by default.
        </p>
        {(
          [
            {
              name: "profilePrivacy",
              label: "My Profile",
              desc: "Who can see your personal information",
              value: settings.profilePrivacy,
            },
            {
              name: "treePrivacy",
              label: "Family Tree",
              desc: "Who can view and explore your tree",
              value: settings.treePrivacy,
            },
            {
              name: "photosPrivacy",
              label: "Photos & Memories",
              desc: "Who can see uploaded photos",
              value: settings.photosPrivacy,
            },
            {
              name: "documentsPrivacy",
              label: "Documents",
              desc: "Who can access sensitive documents",
              value: settings.documentsPrivacy,
            },
            {
              name: "storiesPrivacy",
              label: "Family Stories",
              desc: "Who can read published stories",
              value: settings.storiesPrivacy,
            },
          ] as const
        ).map((item) => (
          <div
            key={item.name}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-3 last:border-0"
          >
            <div>
              <div className="text-sm font-medium text-[var(--ink)]">{item.label}</div>
              <div className="text-xs text-[var(--muted)]">{item.desc}</div>
            </div>
            <select name={item.name} defaultValue={item.value} className={selectClass}>
              {PRIVACY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>

      <section className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="mb-2 flex items-center gap-2">
          <Bell size={16} className="text-[var(--accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Notifications</h2>
        </div>
        {(
          [
            {
              name: "notifyBirthdays",
              label: "Birthday reminders",
              desc: "Get notified before a family birthday",
              on: settings.notifyBirthdays,
            },
            {
              name: "notifyAnniversaries",
              label: "Anniversary reminders",
              desc: "Get notified about upcoming anniversaries",
              on: settings.notifyAnniversaries,
            },
            {
              name: "notifyStories",
              label: "New stories published",
              desc: "When a family member publishes a story",
              on: settings.notifyStories,
            },
            {
              name: "notifyMessages",
              label: "New messages",
              desc: "When someone leaves a family note",
              on: settings.notifyMessages,
            },
          ] as const
        ).map((item) => (
          <label
            key={item.name}
            className="flex cursor-pointer items-center justify-between gap-3 border-b border-[var(--line)] py-3 last:border-0"
          >
            <div>
              <div className="text-sm font-medium text-[var(--ink)]">{item.label}</div>
              <div className="text-xs text-[var(--muted)]">{item.desc}</div>
            </div>
            <input
              type="checkbox"
              name={item.name}
              value="on"
              defaultChecked={item.on}
              className="h-4 w-4 accent-[var(--accent-deep)]"
            />
          </label>
        ))}
      </section>

      <section className="space-y-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[var(--accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Appearance</h2>
        </div>
        <div>
          <div className="mb-2 text-[13px] font-medium text-[var(--ink)]">Theme</div>
          <select name="theme" defaultValue={settings.theme} className={`${selectClass} w-full max-w-xs`}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div>
          <div className="mb-2 text-[13px] font-medium text-[var(--ink)]">Language</div>
          <select
            name="language"
            defaultValue={settings.language}
            className={`${selectClass} w-full max-w-xs`}
          >
            <option value="en">English (US)</option>
            <option value="en-gb">English (UK)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
          </select>
        </div>
      </section>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>
      )}

      <SubmitButton label="Save settings" pendingLabel="Saving…" />

      <section className="rounded-xl border border-[#C47878] bg-[var(--panel)] p-6">
        <h2 className="font-display text-base font-semibold text-[#A05050]">Danger Zone</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
          Account deletion is not available from this screen yet. Contact support if you need to
          permanently remove your Roots & Relations workspace and all family data. This action
          cannot be undone once enabled.
        </p>
      </section>
    </form>
  );
}
