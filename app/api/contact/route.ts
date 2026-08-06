import { NextResponse } from "next/server";

/**
 * Placeholder contact endpoint.
 *
 * For now this validates the payload and logs it server-side so submissions are
 * visible in the server console during development. To enable real delivery,
 * plug an email provider (Resend, SendGrid, Nodemailer, etc.) into the marked
 * section below and send to `site.email`.
 */

interface ContactPayload {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Name, email, subject and message are required." },
      { status: 422 },
    );
  }
  if (!emailRe.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 422 });
  }

  // --- Log submission (replace with real email delivery later) -------------
  console.log("[contact] New submission:", {
    name,
    email,
    phone: body.phone?.trim() || "(none)",
    subject,
    message,
    receivedAt: new Date().toISOString(),
  });
  // -------------------------------------------------------------------------

  return NextResponse.json({ ok: true }, { status: 200 });
}
