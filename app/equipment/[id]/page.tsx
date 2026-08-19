import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EquipmentCalendar from "@/components/EquipmentCalendar";

export default async function EquipmentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, labs(name)")
    .eq("id", params.id)
    .single();

  if (!equipment) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-teal mb-6 focus-ring rounded transition-colors"
      >
        ← Back to equipment
      </Link>

      <div className="mb-6 pb-6 border-b border-border">
        <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">
          {(equipment as any).labs?.name} · {equipment.category}
        </p>
        <h1 className="font-semibold text-2xl text-ink mb-1">{equipment.name}</h1>
        <p className="text-sm text-ink-soft">{equipment.location}</p>
        {equipment.notes && <p className="text-sm text-ink mt-3 max-w-2xl">{equipment.notes}</p>}
        {equipment.status === "maintenance" && (
          <p className="mt-3 inline-block text-xs font-medium text-danger border border-danger/20 bg-danger-soft rounded-control px-2.5 py-1">
            Under maintenance — bookings disabled
          </p>
        )}
      </div>

      <EquipmentCalendar
        equipmentId={equipment.id}
        userId={user?.id ?? null}
        minBookingMinutes={equipment.min_booking_minutes}
        maxBookingMinutes={equipment.max_booking_minutes}
        disabled={equipment.status !== "active"}
      />
    </div>
  );
}
