"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Minus, Plus, MapPin, Users, CalendarDays, Tag, UserRound, Phone, Mail, FileText } from "lucide-react";
import { getAvailableTimeSlots, getSessionLabel, restaurant } from "@/data/site";
import { BookingStepper, STEPS } from "@/components/forms/booking-stepper";
import { BookingCalendar } from "@/components/forms/booking-calendar";

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
    if (!values.date) return;
    const dayOfWeek = new Date(`${values.date}T12:00:00`).getDay();
    const availableTimes = getAvailableTimeSlots(dayOfWeek);
    if (availableTimes.length === 0) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "We are closed on this day" });
    } else if (values.time && !availableTimes.includes(values.time)) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Please choose a time within our opening hours for that day" });
    }
  });

type Values = z.infer<typeof schema>;

const fields = "w-full rounded-xl border border-brand-neutral bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red";

const stepFields: (keyof Values)[][] = [["guests"], ["date", "time"], ["name", "email", "phone", "notes"], []];

function formatLongDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor((total / 60) % 24)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { guests: 2, date: "", time: "", notes: "" } });

  const values = watch();
  const dayOfWeek = values.date ? new Date(`${values.date}T12:00:00`).getDay() : null;
  const sessionLabel = dayOfWeek !== null && values.time ? getSessionLabel(dayOfWeek, values.time) : null;

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onConfirm() {
    setSubmitError("");
    const valid = await trigger();
    if (!valid) return;
    await handleSubmit(async (vals) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals),
      });
      if (!res.ok) {
        setSubmitError("Something went wrong sending your request. Please call us or try again.");
        return;
      }
      setDone(true);
    })();
  }

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
    <div>
      <BookingStepper current={step} />
      <div className="rounded-2xl border border-brand-neutral bg-white p-6 shadow-soft sm:p-9">
        {step === 0 && (
          <div>
            <StepHeading icon={Users} title="Guests" subtitle="Select the number of people in your party" />
            <div className="mt-8 flex flex-col items-center">
              <p className="text-sm font-semibold text-black/60">Party size</p>
              <div className="mt-3 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setValue("guests", Math.max(1, (values.guests || 1) - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-neutral text-black/60 transition hover:border-brand-red hover:text-brand-red"
                  aria-label="Decrease guests"
                >
                  <Minus size={18} />
                </button>
                <span className="display text-5xl">{values.guests || 1}</span>
                <button
                  type="button"
                  onClick={() => setValue("guests", Math.min(6, (values.guests || 1) + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-neutral text-black/60 transition hover:border-brand-red hover:text-brand-red"
                  aria-label="Increase guests"
                >
                  <Plus size={18} />
                </button>
              </div>
              {errors.guests && <p className="mt-3 text-xs font-semibold text-brand-red">{errors.guests.message}</p>}
              <p className="mt-6 max-w-sm text-center text-xs leading-5 text-black/50">
                For parties larger than 6, please call the restaurant directly on{" "}
                <a href={restaurant.phoneHref} className="font-bold underline">
                  {restaurant.phone}
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <StepHeading
              icon={CalendarDays}
              title="When"
              subtitle={`Choose your preferred date and time for ${values.guests || 1} guest${(values.guests || 1) !== 1 ? "s" : ""}`}
            />
            <div className="mt-6">
              <BookingCalendar
                date={values.date}
                time={values.time}
                onDateChange={(d) => setValue("date", d, { shouldValidate: true })}
                onTimeChange={(t) => setValue("time", t, { shouldValidate: true })}
                dateError={errors.date?.message}
                timeError={errors.time?.message}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeading icon={UserRound} title="Details" subtitle="We'll use this to confirm your booking" />
            <div className="mt-6 space-y-5">
              <Label label="Full name" error={errors.name?.message}>
                <input {...register("name")} autoComplete="name" className={fields} />
              </Label>
              <Label label="Phone number" error={errors.phone?.message}>
                <input {...register("phone")} type="tel" autoComplete="tel" className={fields} />
              </Label>
              <Label label="Email address" error={errors.email?.message}>
                <input {...register("email")} type="email" autoComplete="email" className={fields} />
              </Label>
              <Label label="Special requests or notes (optional)" error={errors.notes?.message}>
                <textarea
                  {...register("notes")}
                  rows={4}
                  placeholder="Any special requests, dietary requirements, or notes for the restaurant…"
                  className={`${fields} resize-y`}
                />
              </Label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="display text-3xl uppercase">Almost done</h3>
            <p className="mt-1 text-sm text-black/55">Please review your booking before confirming.</p>

            <p className="mt-7 text-xs font-bold uppercase tracking-wider text-brand-red">Review &amp; confirm</p>
            <p className="mt-3 font-display text-2xl uppercase">{restaurant.name}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-black/60">
              <MapPin size={15} className="shrink-0 text-brand-red" />
              {restaurant.address.join(", ")}
            </p>

            <div className="mt-6 space-y-3 border-t border-brand-neutral pt-5 text-sm">
              <p className="flex items-center gap-2">
                <Users size={15} className="text-brand-red" />
                {values.guests} guest{values.guests !== 1 ? "s" : ""}
              </p>
              <p className="flex items-start gap-2">
                <CalendarDays size={15} className="mt-0.5 shrink-0 text-brand-red" />
                <span>
                  {values.date && formatLongDate(values.date)}
                  <br />
                  <span className="text-black/60">
                    {values.time} – {values.time && addMinutesToTime(values.time, 120)}
                  </span>
                </span>
              </p>
              {sessionLabel && (
                <p className="flex items-center gap-2">
                  <Tag size={15} className="text-brand-red" />
                  <span className="text-xs font-bold uppercase tracking-wider">{sessionLabel}</span>
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-brand-neutral pt-5 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-black/40">Contact information</p>
              <p className="flex items-center gap-2">
                <UserRound size={15} className="text-brand-red" />
                {values.name}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-brand-red" />
                {values.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-brand-red" />
                {values.email}
              </p>
            </div>

            <div className="mt-6 space-y-2 border-t border-brand-neutral pt-5 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-black/40">Special requests or notes</p>
              <p className="flex items-start gap-2 text-black/60">
                <FileText size={15} className="mt-0.5 shrink-0 text-brand-red" />
                {values.notes || "None provided"}
              </p>
            </div>

            <p className="mt-6 text-xs font-semibold text-brand-red">
              Your booking request is not sent until you tap &ldquo;Confirm Booking&rdquo;.
            </p>
          </div>
        )}

        {submitError && <p className="mt-4 text-sm font-semibold text-brand-red">{submitError}</p>}

        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-brand-neutral px-6 py-3 text-xs font-bold uppercase tracking-wider text-black/70 transition hover:border-black"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-brand-red px-7 py-4 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-brand-red-dark"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className="flex items-center gap-2 rounded-full bg-brand-red px-7 py-4 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-brand-red-dark disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? "Sending request…" : "Confirm Booking"}
            </button>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-black/45">
        Bookings require a minimum of four hours’ notice. We are closed on Sundays. You&apos;ll receive a response
        from us by email or phone to confirm your table.
      </p>
    </div>
  );
}

function StepHeading({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="display text-2xl uppercase">{title}</h3>
        <p className="text-sm text-black/55">{subtitle}</p>
      </div>
    </div>
  );
}

function Label({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="mt-2">{children}</div>
      {error && <span className="mt-1 block text-xs font-normal text-brand-red">{error}</span>}
    </label>
  );
}
