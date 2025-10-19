"use client";

import SubmitDealForm from "@/components/forms/SubmitDealForm";

export default function SubmitPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Submit a Deal</h1>
        <p className="text-muted-foreground">
          Know about a great local deal? Share it with the community!
        </p>
      </div>

      <SubmitDealForm showCard={true} />
    </div>
  );
}
