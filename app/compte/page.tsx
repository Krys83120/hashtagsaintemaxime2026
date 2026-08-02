import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountDashboard from "@/components/AccountDashboard";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/compte/connexion/");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, items, total, status, created_at, tracking_number, carrier, tracking_token")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AccountDashboard
      userId={user.id}
      email={user.email || ""}
      fullName={(user.user_metadata as any)?.full_name || ""}
      phone={(user.user_metadata as any)?.phone || ""}
      address={(user.user_metadata as any)?.address || { line1: "", postalCode: "", city: "" }}
      orders={orders || []}
    />
  );
}
