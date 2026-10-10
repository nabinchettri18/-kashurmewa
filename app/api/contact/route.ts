import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        subject.length > 160 || !message || message.length > 5000) {
      return jsonError("Please check the form fields and try again.", 400);
    }
    // Reject oversized request bodies and obvious automated submissions.
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 12_000) return jsonError("Message is too large.", 413);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("km_contact_messages").insert({ name, email, subject, message });
    if (error) {
      console.error("Contact submission failed:", error.message);
      return jsonError("We couldn’t save your message right now. Please try again later.", 503);
    }
    return NextResponse.json({ success: true, message: "Your message has been received." });
  } catch (error) {
    if (error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return jsonError("The contact form is not configured on the server yet. Please email the store directly.", 503);
    }
    return jsonError("Please send a valid message and try again.", 400);
  }
}
