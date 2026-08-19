"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import CancelBookingButton from "@/components/CancelBookingButton";

interface BookingRow {
  id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: "confirmed" | "cancelled";
  equipment?: {
    id: string;
    name: string;
    location: string;
    labs?: { name: string } | null;
  } | null;
}

type Tab = "upcoming" | "past" | "cancelled";

export default function BookingsTabs({ bookings }: { bookings: BookingRow[] }) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const now = useMemo(() => new Date(), []);

  const upcoming = bookings.filter((b) => b.status === "confirmed" && new Date(b.end_time) >= now);
  const past = bookings.filter((b) => b.status === "confirmed" && new Date(b.end_time) < now);
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const tabs: { id: Tab; label: string; rows: BookingRow[] }[] = [
    { id: "upcoming", label: "Upcoming", rows: upcoming },
    { id: "past", label: "Past", rows: past },
    { id: "cancelled", label: "Cancelled", rows: cancelled },
  ];

  const activeRows = tabs.find((t) => t.id === tab)?.rows ?? [];

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors focus-ring ${
              tab === t.id
                ? "border-teal text-teal"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-ink-soft">{t.rows.length}</span>
          </button>
        ))}
      </div>

      {activeRows.length === 0 ? (
        <div className="border border-border rounded-card bg-surface py-16 px-6 text-center">
          <p className="font-medium text-ink mb-1">
            {tab === "upcoming" && "No upcoming bookings"}
            {tab === "past" && "No past bookings"}
            {tab === "cancelled" && "No cancelled bookings"}
          </p>
          <p className="text-sm text-ink-soft mb-5">
            {tab === "upcoming"
              ? "Head to the equipment list to reserve a slot."
              : "Bookings will show up here once you have some."}
          </p>
          {tab === "upcoming" && (
            <Link
              href="/"
              className="inline-block bg-teal text-white text-sm font-medium rounded-control px-4 py-2 hover:bg-teal-hover transition-colors focus-ring"
            >
              Browse equipment
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeRows.map((b) => (
            <div
              key={b.id}
              className="border border-border rounded-card bg-surface shadow-card p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-ink">{b.equipment?.name}</p>
                <p className="text-xs text-ink-soft mb-1">
                  {b.equipment?.labs?.name ? `${b.equipment.labs.name} · ` : ""}
                  {b.equipment?.location}
                </p>
                <p className="text-sm text-ink">
                  {format(new Date(b.start_time), "EEE, MMM d · h:mm a")} –{" "}
                  {format(new Date(b.end_time), "h:mm a")}
                </p>
                {b.purpose && <p className="text-sm text-ink-soft mt-1">{b.purpose}</p>}
                {tab === "cancelled" && (
                  <span className="inline-block mt-2 text-xs font-medium text-ink-soft bg-bg border border-border rounded-control px-2 py-0.5">
                    Cancelled
                  </span>
                )}
              </div>
              {tab === "upcoming" && <CancelBookingButton bookingId={b.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
