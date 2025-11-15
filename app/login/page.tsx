"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const sp = useSearchParams();
  const redirectTo = sp?.get("redirectTo") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // successful login → go to intended destination
      window.location.href = redirectTo;
    } catch (err: any) {
      setStatus("error");
      setError(err?.message ?? "Login failed");
    } finally {
      setStatus((s) => (s === "loading" ? "idle" : s));
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-slate-500 mt-2">
        Enter your email and password. You'll be sent back to{" "}
        <code>{redirectTo}</code> after signing in.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="email"
        />
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email || !password}
          className="w-full rounded-lg px-3 py-2 border bg-orange-500 text-white disabled:opacity-50"
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-4 text-red-600">Error: {error}</p>
      )}

      <div className="mt-6 text-sm text-slate-500">
        <a href="/reset-password" className="hover:underline">Forgot password?</a>
      </div>
    </div>
  );
}
