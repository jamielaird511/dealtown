"use client";

import { useState } from "react";
import { approveDeal } from "@/lib/actions/moderateDeal";
import { Button } from "@/components/ui/button";

interface ApproveButtonProps {
  submissionId: number;
}

export function ApproveButton({ submissionId }: ApproveButtonProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    setStatus(null);

    const result = await approveDeal(submissionId);

    if (result.success) {
      setStatus({ type: "success", message: "Approved!" });
    } else {
      setStatus({ type: "error", message: result.error || "Failed to approve" });
      setIsApproving(false);
    }
  };

  if (status?.type === "success") {
    return (
      <div className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
        ✓ Approved
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleApprove}
        disabled={isApproving}
        size="sm"
        variant="default"
      >
        {isApproving ? "Approving..." : "Approve"}
      </Button>
      {status?.type === "error" && (
        <p className="text-xs text-destructive">{status.message}</p>
      )}
    </div>
  );
}

