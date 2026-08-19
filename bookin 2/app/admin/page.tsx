import { createClient } from "@/lib/supabase/server";
import AdminEquipmentManager from "@/components/AdminEquipmentManager";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isAdmin = profile?.role === "lab_admin" || profile?.role === "super_admin";

  const { data: labs } = await supabase.from("labs").select("id, name").order("name");
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, labs(name)")
    .order("name");

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-12 h-12 rounded-full bg-teal-soft flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="font-semibold text-ink mb-1">Admin access required</p>
        <p className="text-sm text-ink-soft">
          Contact your lab admin if you need equipment added or edited.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-ink mb-1">Admin</h1>
        <p className="text-ink-soft text-sm">Add and manage equipment across your institution.</p>
      </div>
      <AdminEquipmentManager labs={labs ?? []} initialEquipment={equipment ?? []} />
    </div>
  );
}
