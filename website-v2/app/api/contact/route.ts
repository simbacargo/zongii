import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { CONTACT_INFO } from "@/lib/content";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { website, ...data } = parsed.data;
  // Honeypot tripped — pretend success, drop silently.
  if (website) return NextResponse.json({ ok: true });

  const subject = `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`;
  const text = [
    `Name: ${data.name}`,
    data.company ? `Company: ${data.company}` : null,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : null,
    "",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: process.env.CONTACT_FROM || "Zongii Website <onboarding@resend.dev>",
        to: process.env.CONTACT_TO || CONTACT_INFO.emailSales,
        replyTo: data.email || undefined,
        subject,
        text,
      });
    } catch (err) {
      console.error("[contact] email send failed:", err);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } else {
    // No email provider configured — log so the enquiry isn't lost in dev.
    console.info("[contact] (no RESEND_API_KEY) enquiry received:\n" + text);
  }

  return NextResponse.json({ ok: true });
}
