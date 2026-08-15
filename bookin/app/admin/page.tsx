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
      <div className="max-w-md mx-auto text-center py-16">
        <p className="font-mono text-sm text-ink-soft border border-line p-6">
          Admin access required. Contact your lab admin if you need equipment added or edited.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-700 text-2xl mb-1">Admin</h1>
      <p className="text-ink-soft font-mono text-sm mb-6">
        Add and manage equipment across your institution.
      </p>
      <AdminEquipmentManager labs={labs ?? []} initialEquipment={equipment ?? []} />
    </div>
  );
}
