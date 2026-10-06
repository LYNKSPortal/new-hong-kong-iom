"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-charcoal px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-soft">
        <p className="eyebrow">New Hong Kong</p>
        <h1 className="display mt-2 text-4xl uppercase">Reset Password</h1>
        {sent ? (
          <p className="mt-6 text-sm leading-6 text-black/70">
            If an admin account exists for that email, we&apos;ve sent a link to reset your password. It expires in
            1 hour.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-sm font-semibold">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-brand-neutral px-4 py-3 text-sm outline-none focus:border-brand-red"
              />
            </label>
            {error && <p className="mt-4 text-sm font-semibold text-brand-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-full bg-brand-red px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-red-dark disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <Link
          href="/admin/login"
          className="mt-5 block text-center text-xs font-semibold text-black/50 underline hover:text-black"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
