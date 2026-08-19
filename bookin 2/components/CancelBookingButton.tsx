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
      className="text-sm font-medium text-danger border border-danger/20 rounded-control px-3 py-1.5 hover:bg-danger-soft disabled:opacity-50 focus-ring shrink-0 transition-colors"
    >
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
