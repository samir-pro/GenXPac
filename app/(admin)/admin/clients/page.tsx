import { createClient } from "@/lib/supabase/server";
import { ClientsTable } from "@/components/admin/clients-table";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Clients (boutiques)</h2>
      <ClientsTable clients={(clients ?? []) as Profile[]} />
    </div>
  );
}
