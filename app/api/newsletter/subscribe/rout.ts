import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from("newsletter_subscribers")
    .upsert({ email: cleanEmail, active: true }, { onConflict: "email" });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    await sendNewsletterWelcomeEmail({ to: cleanEmail });
  } catch (err: any) {
    console.error("Erreur envoi email newsletter:", err.message);
    // On ne bloque pas l'inscription si l'email échoue à partir
  }

  return NextResponse.json({ ok: true, code: "NEWSLETTER10" });
}
