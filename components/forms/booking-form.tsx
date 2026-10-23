"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { getAvailableTimeSlots, getTimeSlotOptions } from "@/data/site";

const schema = z
  .object({
    guests: z.coerce.number().min(1, "Select party size").max(6, "For parties larger than 6, please call us"),
    date: z.string().min(1, "Choose a date"),
    time: z.string().min(1, "Choose a time"),
    name: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone number"),
    notes: z.string().max(500).optional(),
  })
  .superRefine((values, ctx) => {
    const dayOfWeek = new Date(`${values.date}T12:00:00`).getDay();
    const availableTimes = getAvailableTimeSlots(dayOfWeek);
    if (availableTimes.length === 0) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "We are closed on Sundays" });
    } else if (values.time && !availableTimes.includes(values.time)) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Please choose a time within our opening hours for that day" });
    }
  });

type Values = z.infer<typeof schema>;

const fields = "w-full rounded-xl border border-brand-neutral bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red";

export function BookingForm() {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { guests: 2 } });

  const date = watch("date");
  const dayOfWeek = date ? new Date(`${date}T12:00:00`).getDay() : null;
  const timeOptions = dayOfWeek !== null ? getTimeSlotOptions(dayOfWeek) : [];
  const isClosedDay = date !== "" && dayOfWeek !== null && timeOptions.length === 0;

  if (done) {
    return (
      <div className="rounded-2xl bg-brand-charcoal p-10 text-center text-white">
        <CheckCircle2 className="mx-auto text-brand-red" size={42} />
        <h2 className="display mt-6 text-5xl uppercase">Request received.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/70">
          Thank you. We will confirm your table by email or telephone shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setSubmitError("");
        const res = await fetch("/api/bookings", {
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Label label="Guests" error={errors.guests?.message}>
          <select {...register("guests")} className={fields}>
            {[1, 2, 3, 4, 5, 6].map((x) => (
              <option key={x} value={x}>
                {x} guest{x !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </Label>
        <Label label="Date" error={errors.date?.message}>
          <input
            {...register("date", { onChange: () => resetField("time", { defaultValue: "" }) })}
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            className={fields}
          />
        </Label>
        <Label label="Time" error={errors.time?.message}>
          <select {...register("time")} className={fields} disabled={date === "" || isClosedDay}>
            <option value="">{date === "" ? "Choose a date first" : isClosedDay ? "Closed on this day" : "Select a time"}</option>
            {timeOptions.map(({ time, available }) => (
              <option key={time} value={available ? time : ""} disabled={!available}>
                {available ? time : `${time} — Fully booked`}
              </option>
            ))}
          </select>
        </Label>
        <Label label="Your name" error={errors.name?.message}>
          <input {...register("name")} autoComplete="name" className={fields} />
        </Label>
        <Label label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" autoComplete="email" className={fields} />
        </Label>
        <Label label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} type="tel" autoComplete="tel" className={fields} />
        </Label>
      </div>
      <Label label="Notes (optional)" error={errors.notes?.message}>
        <textarea {...register("notes")} rows={4} className={`${fields} resize-y`} />
      </Label>
      <p className="mt-5 rounded-xl bg-brand-neutral/60 p-4 text-sm leading-6">
        Online bookings are available for up to 6 guests. For larger groups, please call us on{" "}
        <a href="tel:+441624621059" className="font-bold underline">
          +44 1624 621059
        </a>{" "}
        so we can look after you properly.
      </p>
      <p className="mt-5 text-xs leading-5 text-black/55">
        Bookings require a minimum of four hours’ notice. We are closed on Sundays.
      </p>
      {submitError && <p className="mt-4 text-sm font-semibold text-brand-red">{submitError}</p>}
      <button
        disabled={isSubmitting}
        className="mt-6 rounded-full bg-brand-red px-7 py-4 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-brand-red-dark disabled:opacity-60"
      >
        {isSubmitting ? "Sending request…" : "Request a table"}
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
