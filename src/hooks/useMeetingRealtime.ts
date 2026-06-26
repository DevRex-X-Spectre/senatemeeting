"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/browser";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface MeetingRealtimeState {
  agendaItems: any[];
  motions: any[];
  quorum: any | null;
  attendance: any[];
}

export function useMeetingRealtime(meetingId: string, initialState: MeetingRealtimeState) {
  const [state, setState] = React.useState<MeetingRealtimeState>(initialState);

  React.useEffect(() => {
    const supabase = createClient();
    const channel: RealtimeChannel = supabase.channel(`meeting:${meetingId}`);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "agenda_items",
        filter: `meeting_id=eq.${meetingId}`,
      },
      (payload: any) => {
        setState((prev) => {
          if (payload.eventType === "DELETE") {
            return { ...prev, agendaItems: prev.agendaItems.filter((i: any) => i.id !== payload.old.id) };
          }
          const exists = prev.agendaItems.find((i: any) => i.id === payload.new.id);
          if (exists) {
            return {
              ...prev,
              agendaItems: prev.agendaItems.map((i: any) =>
                i.id === payload.new.id ? { ...i, ...payload.new } : i,
              ),
            };
          }
          return {
            ...prev,
            agendaItems: [...prev.agendaItems, payload.new].sort(
              (a: any, b: any) => a.order_index - b.order_index,
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
      (payload: any) => {
        setState((prev) => {
          if (payload.eventType === "DELETE") {
            return { ...prev, motions: prev.motions.filter((m: any) => m.id !== payload.old.id) };
          }
          const exists = prev.motions.find((m: any) => m.id === payload.new.id);
          if (exists) {
            return {
              ...prev,
              motions: prev.motions.map((m: any) =>
                m.id === payload.new.id ? { ...m, ...payload.new } : m,
              ),
            };
          }
          return { ...prev, motions: [...prev.motions, payload.new] };
        });
      },
    );

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes" },
      () => setState((prev) => ({ ...prev })),
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "attendance",
        filter: `meeting_id=eq.${meetingId}`,
      },
      (payload: any) => {
        setState((prev) => {
          if (payload.eventType === "DELETE") {
            return {
              ...prev,
              attendance: prev.attendance.filter(
                (a: any) => !(a.meeting_id === payload.old.meeting_id && a.user_id === payload.old.user_id),
              ),
            };
          }
          const exists = prev.attendance.find(
            (a: any) => a.meeting_id === payload.new.meeting_id && a.user_id === payload.new.user_id,
          );
          if (exists) return prev;
          return { ...prev, attendance: [...prev.attendance, payload.new] };
        });
      },
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      quorum: {
        meeting_id: meetingId,
        denominator: prev.quorum?.denominator ?? 0,
        present: prev.attendance.length,
        quorum_met:
          prev.attendance.length >=
          Math.ceil((prev.quorum?.denominator ?? 0) / 2),
      },
    }));
  }, [meetingId, state.attendance.length]);

  return state;
}