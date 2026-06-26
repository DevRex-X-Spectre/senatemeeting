"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateProfileAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui";
import { useFormStatus } from "react-dom";
import type { Profile } from "@/types/domain";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-signal-blue px-5 text-[14px] font-semibold text-paper transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, null);
  const [name, setName] = React.useState(profile.full_name);
  const [title, setTitle] = React.useState(profile.title ?? "");
  const [avatar, setAvatar] = React.useState(profile.avatar_url ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-caption text-danger">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-md bg-success-soft px-3 py-2 text-caption text-success">
          Profile updated successfully.
        </p>
      )}
      <input type="hidden" name="fullName" value={name} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="avatarUrl" value={avatar} />
      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Professor of Computer Science"
      />
      <Input
        label="Avatar URL (optional)"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="https://example.com/avatar.jpg"
      />
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}