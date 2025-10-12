// src/components/SignOutButton.tsx
"use client";

export default function SignOutButton() {
  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/";
  }

  return (
    <button className="rounded-xl bg-gray-100 px-3 py-2 text-sm" onClick={handleSignOut}>
      Sign out
    </button>
  );
}
