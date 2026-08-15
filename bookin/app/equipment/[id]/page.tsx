import { notFound } from "next/navigation";
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
      <div className="mb-6 pb-4 border-b border-line">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-1">
          {(equipment as any).labs?.name} · {equipment.category}
        </p>
        <h1 className="font-display font-700 text-2xl mb-1">{equipment.name}</h1>
        <p className="font-mono text-sm text-ink-soft">{equipment.location}</p>
        {equipment.notes && <p className="text-sm mt-2 max-w-2xl">{equipment.notes}</p>}
        {equipment.status === "maintenance" && (
          <p className="mt-3 inline-block text-xs font-mono text-signal border border-signal/30 bg-signal/5 px-2 py-1">
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
