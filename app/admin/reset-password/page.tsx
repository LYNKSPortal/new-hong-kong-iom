"use client";
import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Something went wrong. Please request a new reset link.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/login"), 2000);
  }

  if (!token) {
    return (
      <p className="mt-6 text-sm leading-6 text-black/70">
        This reset link is missing its token. Please request a new one from the{" "}
        <Link href="/admin/forgot-password" className="font-bold underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  if (done) {
    return (
      <p className="mt-6 text-sm leading-6 text-black/70">
        Your password has been updated. Redirecting you to login…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <label className="block text-sm font-semibold">
        New password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-brand-neutral px-4 py-3 text-sm outline-none focus:border-brand-red"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Confirm new password
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-brand-neutral px-4 py-3 text-sm outline-none focus:border-brand-red"
        />
      </label>
      {error && <p className="mt-4 text-sm font-semibold text-brand-red">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-full bg-brand-red px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-red-dark disabled:opacity-60"
      >
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-charcoal px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-soft">
        <p className="eyebrow">New Hong Kong</p>
        <h1 className="display mt-2 text-4xl uppercase">Set New Password</h1>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
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
