"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function parseIso(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export default function DatePicker({ id, value, onChange }: DatePickerProps) {
  const selected = value ? parseIso(value) : new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideDown(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideDown);
    return () => document.removeEventListener("mousedown", onOutsideDown);
  }, []);

  function openPicker() {
    const base = value ? parseIso(value) : new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  }

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function selectDay(day: number) {
    onChange(toIso(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = mondayIndex(new Date(viewYear, viewMonth, 1));
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  const todayIso = toIso(new Date());

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="flex w-full items-center gap-2 rounded-xl border border-card-border bg-white/70 px-3.5 py-2.5 text-left text-[15px] text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <CalendarDays
          className="h-4 w-4 shrink-0 text-foreground-soft"
          aria-hidden="true"
        />
        {value || "Tarih seç"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-card-border bg-card p-3 shadow-[0_20px_48px_-16px_rgba(79,47,31,0.4)]">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Önceki ay"
              className="rounded-full p-1 text-foreground-soft transition-colors hover:bg-soil-crust/10"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Sonraki ay"
              className="rounded-full p-1 text-foreground-soft transition-colors hover:bg-soil-crust/10"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-foreground-soft">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <span key={`blank-${i}`} />;
              const iso = toIso(new Date(viewYear, viewMonth, day));
              const isSelected = iso === value;
              const isToday = iso === todayIso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                    isSelected
                      ? "bg-accent font-semibold text-card"
                      : isToday
                        ? "border border-accent text-accent-strong"
                        : "text-foreground hover:bg-soil-crust/15"
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
  );
}
