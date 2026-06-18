"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  return { supabase, user };
}

export async function createPreorder(
  productId: string,
  quantity: number,
  notes: string
) {
  const { supabase, user } = await getUser();
  if (quantity < 1) throw new Error("Quantité invalide");
  const { error } = await supabase.from("preorders").insert({
    product_id: productId,
    client_id: user.id,
    quantity,
    notes: notes || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/preorders");
}

export async function cancelPreorder(id: string) {
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("preorders")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("client_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/preorders");
}

export async function updatePreorderQuantity(id: string, quantity: number) {
  const { supabase, user } = await getUser();
  if (quantity < 1) throw new Error("Quantité invalide");
  const { error } = await supabase
    .from("preorders")
    .update({ quantity })
    .eq("id", id)
    .eq("client_id", user.id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  revalidatePath("/preorders");
}

export async function sendMessage(preorderId: string, content: string) {
  const { supabase, user } = await getUser();
  if (!content.trim()) return;
  const { error } = await supabase.from("messages").insert({
    preorder_id: preorderId,
    sender_id: user.id,
    content: content.trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/messages");
}
