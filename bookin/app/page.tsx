import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: equipment } = await supabase
    .from("equipment")
    .select("id, name, category, location, status, lab_id, labs(name)")
    .neq("status", "retired")
    .order("name");

  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("equipment_id, end_time")
    .eq("status", "confirmed")
    .lte("start_time", new Date().toISOString())
    .gte("end_time", new Date().toISOString());

  const inUseIds = new Set((activeBookings ?? []).map((b) => b.equipment_id));

  const grouped = new Map<string, typeof equipment>();
  (equipment ?? []).forEach((item: any) => {
    const labName = item.labs?.name ?? "Unassigned";
    if (!grouped.has(labName)) grouped.set(labName, []);
    grouped.get(labName)!.push(item);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-700 text-2xl mb-1">Equipment</h1>
        <p className="text-ink-soft font-mono text-sm">
          Browse by lab. Pick an item to see its calendar and book a slot.
        </p>
      </div>

      {grouped.size === 0 && (
        <p className="text-ink-soft font-mono text-sm border border-line p-6 text-center">
          No equipment yet. An admin can add some from the Admin panel.
        </p>
      )}

      {Array.from(grouped.entries()).map(([labName, items]) => (
        <section key={labName} className="mb-10">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-soft mb-3 pb-2 border-b border-line">
            {labName}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items!.map((item: any) => {
              const status = item.status === "maintenance"
                ? "maintenance"
                : inUseIds.has(item.id)
                ? "booked"
                : "available";
              const statusLabel = {
                available: "Available now",
                booked: "In use",
                maintenance: "Maintenance",
              }[status];

              return (
                <Link
                  key={item.id}
                  href={`/equipment/${item.id}`}
                  className="border border-line bg-paper hover:border-ink transition-colors p-4 block focus-ring"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-600 text-base leading-tight">{item.name}</h3>
                    <span className={`status-dot status-dot--${status} mt-1.5`} aria-hidden />
                  </div>
                  <p className="text-xs font-mono text-ink-soft mb-1">{item.category}</p>
                  <p className="text-xs font-mono text-ink-soft mb-3">{item.location}</p>
                  <p className="text-xs font-mono">{statusLabel}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
