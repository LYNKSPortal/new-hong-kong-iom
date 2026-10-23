"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { getTimeSlotOptions } from "@/data/site";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function formatNavDate(d: Date): string {
  return `${d.toLocaleDateString("en-GB", { month: "long" })} ${ordinal(d.getDate())}, ${d.getFullYear()}`;
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function BookingCalendar({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateError?: string;
  timeError?: string;
}) {
  const today = startOfDay(new Date());
  const selected = date ? parseISODate(date) : null;
  const [viewMonth, setViewMonth] = useState(() => new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(!date);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectDate(d: Date) {
    onDateChange(toISODate(d));
    onTimeChange("");
    setShowCalendar(false);
  }

  function isDisabled(d: Date): boolean {
    if (startOfDay(d) < today) return true;
    return getTimeSlotOptions(d.getDay()).length === 0;
  }

  function navigateDay(delta: number) {
    const base = selected ?? today;
    let next = addDays(base, delta);
    if (startOfDay(next) < today) next = today;
    selectDate(next);
    setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  const firstOfMonth = viewMonth;
  const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first offset
  const canGoPrevMonth = addMonths(firstOfMonth, 0) > new Date(today.getFullYear(), today.getMonth(), 1);

  const dayOfWeek = selected ? selected.getDay() : null;
  const timeOptions = dayOfWeek !== null ? getTimeSlotOptions(dayOfWeek) : [];
  const isClosedDay = selected !== null && timeOptions.length === 0;

  return (
    <div>
      <div ref={containerRef} className="relative">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateDay(-1)}
            disabled={!selected || startOfDay(selected) <= today}
            aria-label="Previous day"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-neutral text-black/50 transition hover:border-brand-red hover:text-brand-red disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowCalendar((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl border border-brand-neutral bg-white px-4 py-3 text-left text-sm outline-none transition focus:border-brand-red"
          >
            <CalendarDays size={17} className="text-brand-red" />
            {selected ? formatNavDate(selected) : "Choose a date"}
          </button>
          <button
            type="button"
            onClick={() => navigateDay(1)}
            aria-label="Next day"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-neutral text-black/50 transition hover:border-brand-red hover:text-brand-red"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        {dateError && <p className="mt-1 text-xs font-normal text-brand-red">{dateError}</p>}

        {showCalendar && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-brand-neutral bg-white p-4 shadow-soft sm:w-80">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                disabled={!canGoPrevMonth}
                aria-label="Previous month"
                className="rounded-full p-1.5 text-black/50 hover:bg-brand-neutral/60 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-sm font-bold uppercase tracking-wide">
                {firstOfMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </p>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
                className="rounded-full p-1.5 text-black/50 hover:bg-brand-neutral/60"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-black/40">
              {WEEKDAY_LABELS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), day);
                const disabled = isDisabled(d);
                const isSelected = selected && toISODate(selected) === toISODate(d);
                const isToday = toISODate(today) === toISODate(d);
                return (
                  <button
                    type="button"
                    key={day}
                    disabled={disabled}
                    onClick={() => selectDate(d)}
                    className={`aspect-square rounded-full text-sm transition ${
                      isSelected
                        ? "bg-brand-red font-bold text-white"
                        : disabled
                          ? "text-black/20"
                          : isToday
                            ? "border border-brand-red font-bold text-brand-red"
                            : "hover:bg-brand-neutral/60"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        {!selected ? (
          <p className="text-sm text-black/45">Choose a date to see available times.</p>
        ) : isClosedDay ? (
          <p className="text-sm text-black/45">We are closed on this day. Please choose another date.</p>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
              {timeOptions.filter((t) => t.available).length} time slots available
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeOptions.map(({ time: t, available }) => (
                <button
                  type="button"
                  key={t}
                  disabled={!available}
                  onClick={() => onTimeChange(t)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    time === t
                      ? "border-brand-red bg-brand-red text-white"
                      : available
                        ? "border-brand-neutral bg-white hover:border-brand-red"
                        : "border-brand-neutral/60 bg-brand-neutral/30 text-black/25"
                  }`}
                >
                  {available ? t : `${t} — Fully booked`}
                </button>
              ))}
            </div>
          </>
        )}
        {timeError && <p className="mt-2 text-xs font-normal text-brand-red">{timeError}</p>}
      </div>
    </div>
  );
}
