import { createClient } from "@/lib/supabase/server";
import EquipmentBrowser from "@/components/EquipmentBrowser";

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-ink mb-1">Equipment</h1>
        <p className="text-ink-soft text-sm">Browse and reserve laboratory equipment.</p>
      </div>

      <EquipmentBrowser equipment={equipment ?? []} inUseIds={inUseIds} />
    </div>
  );
}
