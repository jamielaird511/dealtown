"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message ?? "Failed to send reset email");
    } finally {
      setStatus((s) => (s === "loading" ? "idle" : s));
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <p className="text-sm text-slate-500 mt-2">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="w-full rounded-lg px-3 py-2 border bg-orange-500 text-white disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {status === "sent" && (
        <p className="mt-4 text-green-700">Check your email for a reset link.</p>
      )}
      {status === "error" && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}





