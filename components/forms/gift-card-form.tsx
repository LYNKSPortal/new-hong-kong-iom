"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  value: z.coerce.number().min(10, "Minimum gift card value is £10").max(500, "Maximum gift card value is £500"),
  recipientName: z.string().min(2, "Enter the recipient's name"),
  recipientEmail: z.string().email("Enter a valid email"),
  purchaserName: z.string().min(2, "Enter your name"),
  purchaserEmail: z.string().email("Enter a valid email"),
  message: z.string().max(500).optional(),
});
type Values = z.infer<typeof schema>;

const fields =
  "w-full rounded-xl border border-brand-neutral bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red";
const presetValues = [25, 50, 75, 100];

export function GiftCardForm() {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { value: 50 } });
  const value = watch("value");

  if (done)
    return (
      <div className="rounded-2xl bg-brand-charcoal p-10 text-center text-white">
        <CheckCircle2 className="mx-auto text-brand-red" size={42} />
        <h2 className="display mt-6 text-5xl uppercase">Request received.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/70">
          Thank you. Our team will confirm your gift card and send it on to the recipient shortly.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setSubmitError("");
        const res = await fetch("/api/gift-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          setSubmitError("Something went wrong sending your request. Please call us or try again.");
          return;
        }
        setDone(true);
      })}
      className="rounded-2xl border border-brand-neutral bg-white p-6 shadow-soft sm:p-9"
    >
      <Label label="Gift card value">
        <div className="flex flex-wrap gap-2">
          {presetValues.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setValue("value", amount)}
              className={`rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
                value === amount ? "bg-brand-red text-white" : "bg-brand-neutral text-black hover:bg-brand-neutral/70"
              }`}
            >
              £{amount}
            </button>
          ))}
        </div>
        <input
          {...register("value")}
          type="number"
          min={10}
          max={500}
          step="1"
          className={`${fields} mt-3`}
          placeholder="Or enter a custom amount"
        />
        {errors.value && <span className="mt-1 block text-xs font-normal text-brand-red">{errors.value.message}</span>}
      </Label>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Label label="Recipient's name" error={errors.recipientName?.message}>
          <input {...register("recipientName")} className={fields} />
        </Label>
        <Label label="Recipient's email" error={errors.recipientEmail?.message}>
          <input {...register("recipientEmail")} type="email" className={fields} />
        </Label>
        <Label label="Your name" error={errors.purchaserName?.message}>
          <input {...register("purchaserName")} autoComplete="name" className={fields} />
        </Label>
        <Label label="Your email" error={errors.purchaserEmail?.message}>
          <input {...register("purchaserEmail")} type="email" autoComplete="email" className={fields} />
        </Label>
      </div>
      <Label label="Message for the recipient (optional)" error={errors.message?.message}>
        <textarea {...register("message")} rows={4} className={`${fields} resize-y`} />
      </Label>
      <p className="mt-5 text-xs leading-5 text-black/55">
        Gift card requests are reviewed by our team before being issued — we'll be in touch to confirm and arrange payment.
      </p>
      {submitError && <p className="mt-4 text-sm font-semibold text-brand-red">{submitError}</p>}
      <button
        disabled={isSubmitting}
        className="mt-6 rounded-full bg-brand-red px-7 py-4 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-brand-red-dark disabled:opacity-60"
      >
        {isSubmitting ? "Sending request…" : "Request gift card"}
      </button>
    </form>
  );
}

function Label({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="mb-5 block text-sm font-semibold last:mb-0">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-brand-red">{error}</span>}
    </label>
  );
}
