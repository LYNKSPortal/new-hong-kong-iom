"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid username or password");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-charcoal px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-soft">
        <p className="eyebrow">New Hong Kong</p>
        <h1 className="display mt-2 text-4xl uppercase">Admin Login</h1>
        <div className="mt-8 space-y-4">
          <label className="block text-sm font-semibold">
            Username
            <input
              name="username"
              required
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-brand-neutral px-4 py-3 text-sm outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-brand-neutral px-4 py-3 text-sm outline-none focus:border-brand-red"
            />
          </label>
        </div>
        {error && <p className="mt-4 text-sm font-semibold text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-full bg-brand-red px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
