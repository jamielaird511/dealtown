"use client";
import React from "react";
import SubmitDealForm from "@/components/forms/SubmitDealForm";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Optional override for API endpoint; defaults to "/api/deal-submissions" */
  apiPath?: string;
};

export default function SubmitDealModal({ open, onClose, apiPath = "/api/deal-submissions" }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Scroll container (captures scroll; body remains locked) */}
      <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4 md:items-center z-50">
        {/* The panel */}
        <div className="
          w-full max-w-xl rounded-2xl bg-white shadow-xl
          outline-none
          max-h-[calc(100dvh-2rem)] md:max-h-[80vh]
          overflow-y-auto
          overscroll-contain
          touch-pan-y
          ios-momentum
          relative z-10
        ">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold">Submit a Deal</h2>
              <button
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Preamble / Guardrails */}
            <div className="mt-3 text-sm text-gray-600">
              DealTown is for <strong>time-limited, genuine discounts or specials</strong> — something cheaper or better than the usual offer.
              <div className="mt-2">
                <span className="font-medium">✅ Examples:</span> $8 pints today 4–6pm, Half-price pizza Tuesdays, $15 Lunch Menu.
              </div>
              <div>
                <span className="font-medium">🔎 We review:</span> time-limited deals, genuine discounts, or specials.
              </div>
              <div>
                <span className="font-medium">🚫 Not accepted:</span> ongoing regular prices with no time limit.
              </div>
              <div className="mt-1">All submissions are reviewed before publishing.</div>
            </div>

            {/* Shared form component */}
            <div className="mt-5">
              <SubmitDealForm 
                onSuccess={onClose}
                showCard={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
