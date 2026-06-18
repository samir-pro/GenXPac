import { createClient } from "@/lib/supabase/server";
import { MessagesInterface, type Thread } from "@/components/messages-interface";
import type { Message, Preorder, Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: preorders } = await supabase
    .from("preorders")
    .select("*, product:products(*)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const rows = (preorders ?? []) as unknown as Array<
    Preorder & { product: Product | null }
  >;
  const ids = rows.map((r) => r.id);

  let messages: Message[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .in("preorder_id", ids)
      .order("created_at", { ascending: true });
    messages = (data ?? []) as Message[];
  }

  const threads: Thread[] = rows.map((r) => ({
    preorder: r,
    product: r.product,
    client: null,
    messages: messages.filter((m) => m.preorder_id === r.id),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages</h2>
      <MessagesInterface threads={threads} currentUserId={user!.id} />
    </div>
  );
}
