import { createClient } from "@/lib/supabase/server";
import BookingsTabs from "@/components/BookingsTabs";

export default async function MyBookingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, purpose, status, equipment(id, name, location, labs(name))")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-ink mb-1">My Bookings</h1>
        <p className="text-ink-soft text-sm">Manage your upcoming equipment reservations.</p>
      </div>

      <BookingsTabs bookings={bookings ?? []} />
    </div>
  );
}
