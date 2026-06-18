import { createClient } from "@/lib/supabase/server";
import { MessagesInterface, type Thread } from "@/components/messages-interface";
import type { Message, Preorder, Product, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // All messages, newest threads first via their preorders.
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  const msgs = (messages ?? []) as Message[];
  const preorderIds = Array.from(new Set(msgs.map((m) => m.preorder_id)));

  let rows: Array<
    Preorder & {
      product: Product | null;
      client: Pick<Profile, "shop_name" | "full_name"> | null;
    }
  > = [];

  if (preorderIds.length > 0) {
    const { data } = await supabase
      .from("preorders")
      .select("*, product:products(*), client:profiles(shop_name, full_name)")
      .in("id", preorderIds)
      .order("updated_at", { ascending: false });
    rows = (data ?? []) as unknown as typeof rows;
  }

  const threads: Thread[] = rows.map((r) => ({
    preorder: r,
    product: r.product,
    client: r.client,
    messages: msgs.filter((m) => m.preorder_id === r.id),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages clients</h2>
      <MessagesInterface
        threads={threads}
        currentUserId={user!.id}
        showClient
      />
    </div>
  );
}
