"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateProfileAction } from "@/lib/auth/actions";
import { Input, Button } from "@/components/ui";
import { useFormStatus } from "react-dom";
import type { Profile } from "@/types/domain";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={pending} className="gap-2">
      Save changes
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, null);
  const [name, setName] = React.useState(profile.full_name);
  const [title, setTitle] = React.useState(profile.title ?? "");
  const [avatar, setAvatar] = React.useState(profile.avatar_url ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <p className="rounded-lg border border-danger/10 bg-danger-soft px-3 py-2 text-caption text-danger">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg border border-success/10 bg-success-soft px-3 py-2 text-caption text-success">
          Profile updated successfully.
        </p>
      )}
      <input type="hidden" name="fullName" value={name} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="avatarUrl" value={avatar} />
      <div className="grid gap-4 sm:grid-cols-2">
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
          placeholder="Professor of Computer Science"
        />
      </div>
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