import { createClient } from "@/lib/supabase/server";
import BookingsTabs, { type BookingRow } from "@/components/BookingsTabs";

function fetchBookings(supabase: ReturnType<typeof createClient>, userId: string) {
  return supabase
    .from("bookings")
    .select("id, start_time, end_time, purpose, status, equipment(id, name, location, labs(name))")
    .eq("user_id", userId)
    .order("start_time", { ascending: false });
}

// Derived directly from the query above, so this always matches whatever
// shape Supabase actually infers (including when it defaults nested
// relationships to arrays, since it has no generated Database types to
// confirm cardinality from foreign-key metadata).
type RawBooking = NonNullable<Awaited<ReturnType<typeof fetchBookings>>["data"]>[number];

/**
 * Supabase can return `equipment` (and the nested `labs`) as either a
 * single object or a one-item array, depending on how it infers the
 * relationship. Both `equipment` and `labs` are to-one relationships in
 * the schema (bookings.equipment_id -> equipment.id, equipment.lab_id ->
 * labs.id), so we normalize to a single object here, once, rather than
 * making every consumer of this data handle both shapes.
 */
function normalizeBookings(rows: RawBooking[]): BookingRow[] {
  return rows.map((row) => {
    const rawEquipment = Array.isArray(row.equipment) ? row.equipment[0] ?? null : row.equipment;
    const rawLabs = rawEquipment
      ? Array.isArray(rawEquipment.labs)
        ? rawEquipment.labs[0] ?? null
        : rawEquipment.labs
      : null;

    return {
      id: row.id,
      start_time: row.start_time,
      end_time: row.end_time,
      purpose: row.purpose,
      status: row.status as BookingRow["status"],
      equipment: rawEquipment
        ? {
            id: rawEquipment.id,
            name: rawEquipment.name,
            location: rawEquipment.location,
            labs: rawLabs ? { name: rawLabs.name } : null,
          }
        : null,
    };
  });
}

export default async function MyBookingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: bookings } = await fetchBookings(supabase, user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-ink mb-1">My Bookings</h1>
        <p className="text-ink-soft text-sm">Manage your upcoming equipment reservations.</p>
      </div>

      <BookingsTabs bookings={normalizeBookings(bookings ?? [])} />
    </div>
  );
}
