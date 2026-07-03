"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/browser";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { AgendaItem, Attendance, Motion, QuorumSnapshot } from "@/types/domain";

interface MeetingRealtimeState {
  agendaItems: AgendaItem[];
  motions: Motion[];
  quorum: QuorumSnapshot | null;
  attendance: Attendance[];
  realtimeStatus?: "connecting" | "connected" | "error" | "closed";
}

type RealtimePayload<T extends { id?: string }> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: Partial<T>;
};

type AttendancePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Attendance;
  old: Partial<Attendance>;
};

export function useMeetingRealtime(meetingId: string, initialState: MeetingRealtimeState) {
  const channelId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [state, setState] = React.useState<MeetingRealtimeState>({
    ...initialState,
    realtimeStatus: "connecting",
  });

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;
    const channel: RealtimeChannel = supabase.channel(`meeting:${meetingId}:${channelId}`);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "agenda_items",
        filter: `meeting_id=eq.${meetingId}`,
      },
      (payload) => {
        const event = payload as unknown as RealtimePayload<AgendaItem>;
        if (!active) return;
        setState((prev) => {
          if (event.eventType === "DELETE") {
            return { ...prev, agendaItems: prev.agendaItems.filter((item) => item.id !== event.old.id) };
          }
          const exists = prev.agendaItems.find((item) => item.id === event.new.id);
          if (exists) {
            return {
              ...prev,
              agendaItems: prev.agendaItems.map((item) =>
                item.id === event.new.id ? { ...item, ...event.new } : item,
              ),
            };
          }
          return {
            ...prev,
            agendaItems: [...prev.agendaItems, event.new].sort(
              (a, b) => a.order_index - b.order_index,
            ),
          };
        });
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "motions",
        filter: `meeting_id=eq.${meetingId}`,
      },
      (payload) => {
        const event = payload as unknown as RealtimePayload<Motion>;
        if (!active) return;
        setState((prev) => {
          if (event.eventType === "DELETE") {
            return { ...prev, motions: prev.motions.filter((motion) => motion.id !== event.old.id) };
          }
          const exists = prev.motions.find((motion) => motion.id === event.new.id);
          if (exists) {
            return {
              ...prev,
              motions: prev.motions.map((motion) =>
                motion.id === event.new.id ? { ...motion, ...event.new } : motion,
              ),
            };
          }
          return { ...prev, motions: [...prev.motions, event.new] };
        });
      },
    );

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes" },
      () => {
        if (!active) return;
        setState((prev) => ({ ...prev }));
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "attendance",
        filter: `meeting_id=eq.${meetingId}`,
      },
      (payload) => {
        const event = payload as unknown as AttendancePayload;
        if (!active) return;
        setState((prev) => {
          if (event.eventType === "DELETE") {
            return {
              ...prev,
              attendance: prev.attendance.filter(
                (attendance) => !(attendance.meeting_id === event.old.meeting_id && attendance.user_id === event.old.user_id),
              ),
            };
          }
          const exists = prev.attendance.find(
            (attendance) => attendance.meeting_id === event.new.meeting_id && attendance.user_id === event.new.user_id,
          );
          if (exists) return prev;
          return { ...prev, attendance: [...prev.attendance, event.new] };
        });
      },
    );

    channel.subscribe((status) => {
      if (!active) return;
      if (status === "SUBSCRIBED") {
        setState((prev) => ({ ...prev, realtimeStatus: "connected" }));
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setState((prev) => ({ ...prev, realtimeStatus: "error" }));
      } else if (status === "CLOSED") {
        setState((prev) => ({ ...prev, realtimeStatus: "closed" }));
      }
    });
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [channelId, meetingId]);

  const denominator = state.quorum?.denominator ?? 0;
  const derivedQuorum =
    state.attendance.length > 0
      ? {
          meeting_id: meetingId,
          denominator,
          present: state.attendance.length,
          quorum_met: state.attendance.length >= Math.ceil(denominator / 2),
        }
      : state.quorum;

  return { ...state, quorum: derivedQuorum };
}
