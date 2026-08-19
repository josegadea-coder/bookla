import { createClient } from "@/lib/supabase/server";
import EquipmentBrowser, { type EquipmentItem } from "@/components/EquipmentBrowser";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: equipment } = await supabase
    .from("equipment")
    .select("id, name, category, location, status, notes, lab_id, labs(name)")
    .neq("status", "retired")
    .order("name");

  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("equipment_id, end_time")
    .eq("status", "confirmed")
    .lte("start_time", new Date().toISOString())
    .gte("end_time", new Date().toISOString());

  const inUseIds = (activeBookings ?? []).map((b) => b.equipment_id);

  const normalizedEquipment: EquipmentItem[] = (equipment ?? []).map((item) => {
    const rawLab = Array.isArray(item.labs)
      ? item.labs[0] ?? null
      : item.labs ?? null;

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      location: item.location,
      status: item.status,
      notes: item.notes,
      lab_id: item.lab_id,
      labs: rawLab ? { name: rawLab.name } : null,
    };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-ink mb-1">Equipment</h1>
        <p className="text-ink-soft text-sm">
          Browse and reserve laboratory equipment.
        </p>
      </div>

      <EquipmentBrowser equipment={normalizedEquipment} inUseIds={inUseIds} />
    </div>
  );
}
