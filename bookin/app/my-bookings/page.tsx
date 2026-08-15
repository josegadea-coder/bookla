import { createClient } from "@/lib/supabase/server";
import CancelBookingButton from "@/components/CancelBookingButton";
import { format } from "date-fns";

export default async function MyBookingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, purpose, status, equipment(id, name, location)")
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .gte("end_time", new Date().toISOString())
    .order("start_time");

  return (
    <div>
      <h1 className="font-display font-700 text-2xl mb-1">My bookings</h1>
      <p className="text-ink-soft font-mono text-sm mb-6">Upcoming reservations you've made.</p>

      {!bookings?.length && (
        <p className="font-mono text-sm text-ink-soft border border-line p-6 text-center">
          No upcoming bookings. Head to the equipment list to reserve a slot.
        </p>
      )}

      <div className="space-y-2">
        {bookings?.map((b: any) => (
          <div
            key={b.id}
            className="border border-line p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-display font-600">{b.equipment?.name}</p>
              <p className="font-mono text-xs text-ink-soft">{b.equipment?.location}</p>
              <p className="font-mono text-sm mt-1">
                {format(new Date(b.start_time), "EEE, MMM d · h:mm a")} –{" "}
                {format(new Date(b.end_time), "h:mm a")}
              </p>
              {b.purpose && <p className="text-sm mt-1 text-ink-soft">{b.purpose}</p>}
            </div>
            <CancelBookingButton bookingId={b.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
