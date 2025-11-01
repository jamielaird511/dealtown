// src/app/login/page.tsx
export const metadata = {
  title: "Sign In | DealTown Queenstown",
  description: "Sign in to access DealTown admin features and manage deals.",
  alternates: {
    canonical: "/login",
  },
};

export default function Login() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      {/* PLAIN HTML FORM — browser will POST then follow the 303 */}
      <form action="/api/auth/login" method="post" className="space-y-4" noValidate>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border px-4 py-3"
          placeholder="you@example.com"
        />
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Password"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-orange-500 px-4 py-3 font-medium text-white"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
