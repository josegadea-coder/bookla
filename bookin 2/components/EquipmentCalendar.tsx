"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  addDays,
  format,
  isSameDay,
  startOfDay,
  isBefore,
  isAfter,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";
import BookingModal from "@/components/BookingModal";

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const SLOT_MINUTES = 30;

interface Props {
  equipmentId: string;
  userId: string | null;
  minBookingMinutes: number;
  maxBookingMinutes: number;
  disabled: boolean;
}

export default function EquipmentCalendar({
  equipmentId,
  userId,
  minBookingMinutes,
  maxBookingMinutes,
  disabled,
}: Props) {
  const supabase = createClient();
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const rangeStart = day.toISOString();
    const rangeEnd = addDays(day, 1).toISOString();

    const { data } = await supabase
      .from("bookings")
      .select("id, equipment_id, user_id, start_time, end_time, status, purpose, profiles(full_name, email)")
      .eq("equipment_id", equipmentId)
      .eq("status", "confirmed")
      .lt("start_time", rangeEnd)
      .gt("end_time", rangeStart)
      .order("start_time");

    setBookings((data as any) ?? []);
    setLoading(false);
  }, [day, equipmentId, supabase]);

  useEffect(() => {
    loadBookings();

    // Live updates: if someone else books a slot, everyone viewing sees it instantly
    const channel = supabase
      .channel(`equipment-${equipmentId}-bookings`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `equipment_id=eq.${equipmentId}` },
        () => loadBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [equipmentId, day, loadBookings, refreshKey]);

  const slots = useMemo(() => {
    const list: Date[] = [];
    let cursor = new Date(day);
    cursor.setHours(DAY_START_HOUR, 0, 0, 0);
    const end = new Date(day);
    end.setHours(DAY_END_HOUR, 0, 0, 0);
    while (isBefore(cursor, end)) {
      list.push(new Date(cursor));
      cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60000);
    }
    return list;
  }, [day]);

  function slotStatus(slot: Date) {
    const slotEnd = new Date(slot.getTime() + SLOT_MINUTES * 60000);
    const now = new Date();
    if (isBefore(slotEnd, now)) return "past";
    const match = bookings.find(
      (b) => isBefore(new Date(b.start_time), slotEnd) && isAfter(new Date(b.end_time), slot)
    );
    if (match) return match.user_id === userId ? "mine" : "booked";
    return "open";
  }

  function bookingForSlot(slot: Date) {
    const slotEnd = new Date(slot.getTime() + SLOT_MINUTES * 60000);
    return bookings.find(
      (b) => isBefore(new Date(b.start_time), slotEnd) && isAfter(new Date(b.end_time), slot)
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDay((d) => addDays(d, -1))}
          className="text-sm font-medium px-3 py-1.5 border border-border rounded-control text-ink hover:border-teal hover:text-teal transition-colors focus-ring"
        >
          ← Prev
        </button>
        <div className="text-center">
          <p className="font-semibold text-ink">{format(day, "EEEE, MMM d")}</p>
          {isSameDay(day, new Date()) && (
            <p className="text-xs text-teal font-medium">Today</p>
          )}
        </div>
        <button
          onClick={() => setDay((d) => addDays(d, 1))}
          className="text-sm font-medium px-3 py-1.5 border border-border rounded-control text-ink hover:border-teal hover:text-teal transition-colors focus-ring"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="status-dot status-dot--available" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="status-dot status-dot--booked" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal" /> Your booking
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft py-8 text-center">Loading calendar…</p>
      ) : (
        <div className="border border-border rounded-card divide-y divide-border overflow-hidden bg-surface">
          {slots.map((slot) => {
            const status = slotStatus(slot);
            const booking = bookingForSlot(slot);
            const isClickable = status === "open" && !disabled && userId;

            return (
              <button
                key={slot.toISOString()}
                disabled={!isClickable}
                onClick={() => isClickable && setSelectedSlot(slot)}
                className={`w-full flex items-center gap-4 px-4 py-2.5 text-left transition-colors focus-ring ${
                  isClickable ? "hover:bg-teal-soft cursor-pointer" : "cursor-default"
                } ${status === "past" ? "opacity-40" : ""}`}
              >
                <span className="text-xs text-ink-soft w-16 shrink-0">
                  {format(slot, "h:mm a")}
                </span>
                {status === "booked" && (
                  <span className="flex items-center gap-2 text-sm text-ink">
                    <span className="status-dot status-dot--booked" />
                    Booked{booking?.profiles?.full_name ? ` — ${booking.profiles.full_name}` : ""}
                  </span>
                )}
                {status === "mine" && (
                  <span className="flex items-center gap-2 text-sm text-teal font-medium">
                    <span className="w-2 h-2 rounded-full bg-teal" />
                    Your booking
                  </span>
                )}
                {status === "open" && (
                  <span className="flex items-center gap-2 text-sm text-ink-soft">
                    <span className="status-dot status-dot--available" />
                    {isClickable ? "Tap to book" : "Open"}
                  </span>
                )}
                {status === "past" && <span className="text-sm text-ink-soft">Past</span>}
              </button>
            );
          })}
        </div>
      )}

      {!userId && (
        <p className="mt-4 text-sm text-ink-soft">Sign in to book a slot.</p>
      )}

      {selectedSlot && (
        <BookingModal
          equipmentId={equipmentId}
          userId={userId!}
          slotStart={selectedSlot}
          minBookingMinutes={minBookingMinutes}
          maxBookingMinutes={maxBookingMinutes}
          existingBookings={bookings}
          onClose={() => setSelectedSlot(null)}
          onBooked={() => {
            setSelectedSlot(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
