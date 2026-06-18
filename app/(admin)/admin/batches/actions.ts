"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BatchStatus } from "@/types/database";

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

export async function createBatch(formData: FormData) {
  const supabase = await assertAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Nom requis");
  const { error } = await supabase.from("batches").insert({
    name,
    estimated_arrival: String(formData.get("estimated_arrival") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/batches");
}

export async function updateBatchStatus(id: string, status: BatchStatus) {
  const supabase = await assertAdmin();
  const patch: Record<string, unknown> = { status };
  if (status === "ordered") patch.china_order_date = new Date().toISOString();
  if (status === "arrived") patch.actual_arrival = new Date().toISOString();
  const { error } = await supabase.from("batches").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/batches");
}

export async function updateBatchDates(id: string, formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("batches")
    .update({
      estimated_arrival:
        String(formData.get("estimated_arrival") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/batches");
}

export async function deleteBatch(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("batches").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/batches");
}
