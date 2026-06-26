"use client";

import * as React from "react";
import { Card, CardContent, MotionStatusBadge } from "@/components/ui";
import { VoteButtons } from "@/components/motions/VoteButtons";
import { formatDateTime } from "@/lib/utils/dates";

interface Props {
  motion: any;
  userId: string;
}

export function MotionVoteRow({ motion }: Props) {
  const isVotingOpen = motion.status === "voting_open";

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-3">
          <p className="text-[15px] font-medium text-midnight-navy">{motion.text}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-caption text-slate-blue">
              Raised by {motion.raised_by?.full_name ?? "Unknown"}
            </span>
            {motion.seconded_by ? (
              <span className="text-caption text-slate-blue">
                · Seconded by {motion.seconded_by?.full_name}
              </span>
            ) : null}
            <MotionStatusBadge status={motion.status as any} size="sm" />
          </div>
        </div>
        {isVotingOpen && (
          <div className="flex flex-col gap-3">
            <VoteButtons motionId={motion.id} myChoice={null} />
          </div>
        )}
        {motion.status === "passed" || motion.status === "rejected" ? (
          <p className={`text-caption font-medium ${motion.status === "passed" ? "text-success" : "text-danger"}`}>
            Motion {motion.status}. Closed {motion.closed_at ? formatDateTime(motion.closed_at) : ""}.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}