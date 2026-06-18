import { createClient } from "@/lib/supabase/server";
import {
  PreordersList,
  type ClientPreorder,
} from "@/components/shop/preorders-list";

export const dynamic = "force-dynamic";

export default async function MyPreordersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: preorders } = await supabase
    .from("preorders")
    .select("*, product:products(*)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mes commandes</h2>
      <PreordersList
        preorders={(preorders ?? []) as unknown as ClientPreorder[]}
      />
    </div>
  );
}
