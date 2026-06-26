"use client";

import * as React from "react";
import { useActionState } from "react";
import { voteAction } from "@/lib/motions/actions";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import type { VoteChoice } from "@/types/domain";

const CHOICES: { value: VoteChoice; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "yes", label: "Yes", icon: ThumbsUp },
  { value: "no", label: "No", icon: ThumbsDown },
  { value: "abstain", label: "Abstain", icon: Minus },
];

export function VoteButtons({ motionId, myChoice }: { motionId: string; myChoice: VoteChoice | null }) {
  const [, formAction, pending] = useActionState(voteAction, null);

  return (
    <div className="flex gap-2">
      {CHOICES.map(({ value, label, icon: Icon }) => (
        <form key={value} action={formAction}>
          <input type="hidden" name="motionId" value={motionId} />
          <input type="hidden" name="choice" value={value} />
          <Button
            type="submit"
            variant={myChoice === value ? "primary" : "outline"}
            size="sm"
            disabled={pending}
            loading={pending}
            className={cn(
              "gap-1.5",
              myChoice === value && value === "yes" && "bg-success hover:bg-success/90",
              myChoice === value && value === "no" && "bg-danger hover:bg-danger/90",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        </form>
      ))}
    </div>
  );
}