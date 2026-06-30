"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";

interface RegistrationSuccessModalProps {
  open: boolean;
}

export function RegistrationSuccessModal({ open }: RegistrationSuccessModalProps) {
  const [visible, setVisible] = React.useState(open);
  const router = useRouter();

  function close() {
    setVisible(false);
    router.replace("/pending-approval", { scroll: false });
  }

  return (
    <Modal
      open={visible}
      onClose={close}
      title="Registration submitted"
      description="Your account was created successfully and is waiting for admin approval."
      size="sm"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-lg border border-success/15 bg-success-soft p-3.5 text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p className="text-[14px] leading-[1.5]">
            You can return here after an admin approves your account. Once approved, you will be able to access meetings and participate.
          </p>
        </div>
        <Button type="button" onClick={close} fullWidth>
          Got it
        </Button>
      </div>
    </Modal>
  );
}
