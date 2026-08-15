"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this booking?")) return;
    setLoading(true);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="font-mono text-xs text-signal border border-signal/30 px-3 py-1.5 hover:bg-signal/5 disabled:opacity-50 focus-ring shrink-0"
    >
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
