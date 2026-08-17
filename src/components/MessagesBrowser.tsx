"use client";

import { useActionState } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { ActionState } from "@/actions/auth";
import { createMessageAction } from "@/actions/family";
import { SubmitButton } from "@/components/SubmitButton";

type MessageLite = {
  id: string;
  senderName: string;
  body: string;
  createdAt: string;
};

const initialState: ActionState = {};
const inputClass =
  "w-full rounded-md border border-[var(--line)] bg-[var(--cream-100)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function MessagesBrowser({
  messages,
  defaultSender,
}: {
  messages: MessageLite[];
  defaultSender: string;
}) {
  const [state, formAction] = useActionState(createMessageAction, initialState);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-[var(--ink)]">Messages</h1>
        <p className="mt-0.5 text-[13px] text-[var(--muted)]">
          Family notes and shared updates — newest first
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <Send size={15} className="text-[var(--accent)]" />
          Compose
        </div>
        <label className="block space-y-1.5 text-sm">
          <span className="text-[var(--muted)]">From</span>
          <input
            name="senderName"
            required
            defaultValue={defaultSender}
            className={inputClass}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-[var(--muted)]">Message</span>
          <textarea name="body" required rows={4} className={inputClass} />
        </label>
        {state.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state.success && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.success}
          </p>
        )}
        <SubmitButton label="Send message" pendingLabel="Sending…" />
      </form>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-10 text-center">
            <MessageCircle className="mx-auto mb-3 text-[var(--muted)]" size={28} />
            <p className="text-sm text-[var(--muted)]">No messages yet. Leave the first note.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <article
              key={msg.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--ink)]">{msg.senderName}</div>
                <time className="shrink-0 text-[11px] text-[var(--muted)]">
                  {new Date(msg.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[var(--muted)]">
                {msg.body}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
