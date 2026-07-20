# Appendix A: Source Code Summaries

This appendix contains short summaries of selected core functions from the E-Senate Management System. The full source code remains in the project repository. These excerpts are intentionally brief so that the main report remains focused on implementation results and discussion.

## A.1 Authentication and Staff ID Login

```ts
export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const loginEmail = await resolveLoginEmail(parsed.data.identifier);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail!,
    password: parsed.data.password,
  });

  if (error) return validationError({ identifier: ["Invalid login credentials."] });
  redirect("/dashboard");
}
```

This function validates login input, resolves a staff ID into the internal authentication email where necessary, signs the user in through Supabase Auth, and redirects successful users to the dashboard.

## A.2 Meeting Creation

```ts
export async function createMeetingAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Access denied." };

  const parsed = createMeetingSchema.safeParse({
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt"),
    durationMin: Number(formData.get("durationMin")),
  });

  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  await supabase.from("meetings").insert({
    title: parsed.data.title,
    scheduled_at: parsed.data.scheduledAt,
    duration_min: parsed.data.durationMin,
    created_by: profile.id,
  });
}
```

This function allows only authorized senate managers to create meetings. It validates meeting details and stores the meeting as a database record.

## A.3 Attendance Check-In

```ts
export async function checkInAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const meetingId = formData.get("meetingId") as string;
  const supabase = await createClient();

  await supabase.from("attendance").upsert({
    meeting_id: meetingId,
    user_id: profile.id,
    checked_in_at: new Date().toISOString(),
  });
}
```

This function records a member's attendance for a meeting. The upsert operation prevents unnecessary duplicate attendance records.

## A.4 Voting

```ts
export async function voteAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const parsed = voteSchema.safeParse({
    motionId: formData.get("motionId"),
    choice: formData.get("choice"),
  });

  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  await supabase.from("votes").upsert({
    motion_id: parsed.data.motionId,
    user_id: profile.id,
    choice: parsed.data.choice,
    voted_at: new Date().toISOString(),
  });
}
```

This function validates a member's vote and stores or updates the vote while voting is open for a motion.
