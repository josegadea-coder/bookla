"use client";

import { useState } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";

interface Props {
  equipmentId: string;
  userId: string;
  slotStart: Date;
  minBookingMinutes: number;
  maxBookingMinutes: number;
  existingBookings: Booking[];
  onClose: () => void;
  onBooked: () => void;
}

export default function BookingModal({
  equipmentId,
  userId,
  slotStart,
  minBookingMinutes,
  maxBookingMinutes,
  existingBookings,
  onClose,
  onBooked,
}: Props) {
  const supabase = createClient();
  const durationOptions = buildDurationOptions(minBookingMinutes, maxBookingMinutes);
  const [duration, setDuration] = useState(durationOptions[0] ?? minBookingMinutes);
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const endTime = new Date(slotStart.getTime() + duration * 60000);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("bookings").insert({
      equipment_id: equipmentId,
      user_id: userId,
      start_time: slotStart.toISOString(),
      end_time: endTime.toISOString(),
      purpose,
    });

    setSubmitting(false);

    if (error) {
      // Postgres exclusion constraint violation = someone booked this slot first
      if (error.code === "23P01") {
        setError("That slot was just booked by someone else. Pick another time.");
      } else {
        setError(error.message);
      }
      return;
    }

    onBooked();
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-30"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-card shadow-card max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-lg text-ink mb-1">Confirm booking</h2>
        <p className="text-sm text-ink-soft mb-5">
          {format(slotStart, "EEEE, MMM d · h:mm a")} – {format(endTime, "h:mm a")}
        </p>

        <label className="block text-sm font-medium text-ink mb-1.5">Duration</label>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full border border-border rounded-control bg-surface px-3 py-2 text-sm text-ink mb-4 focus-ring focus:border-teal"
        >
          {durationOptions.map((mins) => (
            <option key={mins} value={mins}>
              {formatDuration(mins)}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-ink mb-1.5">
          Purpose <span className="text-ink-soft font-normal">(optional)</span>
        </label>
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. PCR run for project X"
          className="w-full border border-border rounded-control bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft mb-4 focus-ring focus:border-teal"
        />

        {error && (
          <p className="text-danger text-sm border border-danger/20 bg-danger-soft rounded-control px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-border rounded-control text-sm font-medium text-ink py-2 hover:border-ink transition-colors focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 bg-teal text-white rounded-control text-sm font-medium py-2 hover:bg-teal-hover transition-colors disabled:opacity-50 focus-ring"
          >
            {submitting ? "Booking…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildDurationOptions(min: number, max: number): number[] {
  const options: number[] = [];
  for (let m = min; m <= max; m += min) {
    options.push(m);
    if (options.length >= 12) break;
  }
  return options.length ? options : [min];
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = mins / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hr`;
}
