"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Accès refusé");
  return supabase;
}

export async function setClientApproval(id: string, approved: boolean) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ approved })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/clients");
}
