import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShopShell } from "@/components/shop/shop-shell";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approved, shop_name, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");
  if (!profile?.approved) redirect("/pending");

  return (
    <ShopShell
      userLabel={profile?.shop_name || profile?.full_name || profile?.email || ""}
    >
      {children}
    </ShopShell>
  );
}
