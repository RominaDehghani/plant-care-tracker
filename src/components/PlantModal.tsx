"use client";

import { CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Leaf, Sprout, Trash2, X } from "lucide-react";
import { Plant } from "@/interfaces/Plant";
import DatePicker from "@/components/DatePicker";
import SunlightPicker from "@/components/SunlightPicker";

const MAX_WATERING_INTERVAL = 30;

type PlantFormValues = Omit<Plant, "id">;

interface PlantModalProps {
  mode: "add" | "edit";
  initialValues?: PlantFormValues;
  origin: { x: number; y: number } | null;
  onClose: () => void;
  onSubmit: (values: PlantFormValues) => void;
  onDelete?: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyValues: PlantFormValues = {
  name: "",
  species: "",
  wateringIntervalDays: 7,
  lastWateredDate: todayIso(),
  sunlight: "orta",
  notes: "",
};

const inputClass =
  "rounded-xl border border-card-border bg-white/70 px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-foreground-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "text-sm font-medium text-foreground-soft";

export default function PlantModal({
  mode,
  initialValues,
  origin,
  onClose,
  onSubmit,
  onDelete,
}: PlantModalProps) {
  const [values, setValues] = useState<PlantFormValues>(
    initialValues ?? emptyValues
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [transformOrigin, setTransformOrigin] = useState("50% 85%");
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!origin || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const ox = ((origin.x - rect.left) / rect.width) * 100;
    const oy = ((origin.y - rect.top) / rect.height) * 100;
    setTransformOrigin(`${ox}% ${oy}%`);
  }, [origin]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
    }
    update();
    const settleId = window.setTimeout(update, 350);
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(settleId);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-soil-deep/35 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "add" ? "Yeni bitki ekle" : "Bitkiyi düzenle"}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.12 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.25 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{ transformOrigin }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-card-border bg-card shadow-[0_28px_64px_-20px_rgba(79,47,31,0.45)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 z-10 rounded-full bg-card/80 p-1.5 text-foreground-soft backdrop-blur-sm transition-colors hover:bg-soil-crust/10 hover:text-foreground"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-6 sm:p-7"
        >
          <div>
            <h2 className="font-heading text-xl font-semibold text-accent-strong">
              {mode === "add" ? "Toprağa yeni bir tohum ek" : "Bitkiyi düzenle"}
            </h2>
            <p className="mt-1 text-sm text-foreground-soft">
              {mode === "add"
                ? "Birazdan bahçende yerini alacak."
                : "Bilgilerini güncelle, değişiklikler hemen görünür."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>
                Bitki adı
              </label>
              <div className="relative">
                <Sprout
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-soft"
                  aria-hidden="true"
                />
                <input
                  id="name"
                  ref={firstFieldRef}
                  required
                  value={values.name}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, name: e.target.value }))
                  }
                  placeholder="ör. Salon Ficusu"
                  className={`${inputClass} w-full pl-10`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="species" className={labelClass}>
                Tür
              </label>
              <div className="relative">
                <Leaf
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-soft"
                  aria-hidden="true"
                />
                <input
                  id="species"
                  required
                  value={values.species}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, species: e.target.value }))
                  }
                  placeholder="ör. Ficus lyrata"
                  className={`${inputClass} w-full pl-10`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="wateringIntervalDays" className={labelClass}>
                Sulama aralığı —{" "}
                <span className="font-semibold text-accent-strong">
                  {values.wateringIntervalDays} gün
                </span>
              </label>
              <input
                id="wateringIntervalDays"
                type="range"
                min={0}
                max={MAX_WATERING_INTERVAL}
                value={values.wateringIntervalDays}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    wateringIntervalDays: Number(e.target.value),
                  }))
                }
                className="range-slider"
                style={
                  {
                    "--range-fill": `${
                      (values.wateringIntervalDays / MAX_WATERING_INTERVAL) *
                      100
                    }%`,
                  } as CSSProperties
                }
              />
              <div className="flex justify-between text-[11px] text-foreground-soft">
                <span>Her gün</span>
                <span>{MAX_WATERING_INTERVAL} günde bir</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastWateredDate" className={labelClass}>
                Son sulama
              </label>
              <DatePicker
                id="lastWateredDate"
                value={values.lastWateredDate}
                onChange={(date) =>
                  setValues((v) => ({ ...v, lastWateredDate: date }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Güneş ihtiyacı</span>
              <SunlightPicker
                value={values.sunlight}
                onChange={(sunlight) => setValues((v) => ({ ...v, sunlight }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className={labelClass}>
                Notlar (opsiyonel)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={values.notes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, notes: e.target.value }))
                }
                className={`${inputClass} w-full`}
              />
            </div>

            <div className="mt-1 flex items-center justify-between gap-3">
              {mode === "edit" && onDelete ? (
                confirmingDelete ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground-soft">Emin misin?</span>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="rounded-full bg-status-overdue px-3 py-1.5 font-medium text-white transition hover:opacity-90"
                    >
                      Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="rounded-full px-3 py-1.5 font-medium text-foreground-soft hover:bg-soil-crust/10"
                    >
                      Vazgeç
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    aria-label="Bitkiyi sil"
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-status-overdue transition hover:bg-status-overdue/10"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Sil
                  </button>
                )
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/30 transition hover:bg-accent-strong"
              >
                {mode === "add" ? "Toprağa ek" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>

        {canScrollDown && (
          <motion.button
            type="button"
            onClick={() =>
              scrollRef.current?.scrollBy({ top: 220, behavior: "smooth" })
            }
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            aria-label="Aşağı kaydır"
            className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-card text-accent-strong shadow-[0_8px_20px_-8px_rgba(79,47,31,0.45)]"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
