import * as React from "react";
import {
  itemStatusMeta,
  meetingStatusMeta,
  motionStatusMeta,
} from "@/lib/utils/status";
import type {
  ItemStatus,
  MeetingStatus,
  MotionStatus,
} from "@/types/domain";
import { cn } from "@/lib/utils/cn";

interface BaseProps {
  className?: string;
  withDot?: boolean;
  size?: "sm" | "md";
}

export function MeetingStatusBadge({
  status,
  className,
  withDot = true,
  size = "md",
}: BaseProps & { status: MeetingStatus }) {
  const meta = meetingStatusMeta[status];
  return (
    <span className={cn(meta.badgeClass, size === "sm" ? "!px-2.5 !py-0.5 !text-[11px]" : "", className)}>
      {withDot ? <span className={cn("size-1.5 rounded-full", meta.dotClass)} /> : null}
      {meta.label}
    </span>
  );
}

export function ItemStatusBadge({
  status,
  className,
  withDot = true,
  size = "md",
}: BaseProps & { status: ItemStatus }) {
  const meta = itemStatusMeta[status];
  return (
    <span className={cn(meta.badgeClass, size === "sm" ? "!px-2.5 !py-0.5 !text-[11px]" : "", className)}>
      {withDot ? <span className={cn("size-1.5 rounded-full", meta.dotClass)} /> : null}
      {meta.label}
    </span>
  );
}

export function MotionStatusBadge({
  status,
  className,
  withDot = true,
  size = "md",
}: BaseProps & { status: MotionStatus }) {
  const meta = motionStatusMeta[status];
  return (
    <span className={cn(meta.badgeClass, size === "sm" ? "!px-2.5 !py-0.5 !text-[11px]" : "", className)}>
      {withDot ? <span className={cn("size-1.5 rounded-full", meta.dotClass)} /> : null}
      {meta.label}
    </span>
  );
}