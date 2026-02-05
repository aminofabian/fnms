import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// POST /api/contact - Handle contact form submissions
export async function POST(request: Request) {
  try {
    const input = await request.json();
    const parsed = contactSchema.safeParse(input);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // For now we just validate and return success.
    // To actually send email: integrate Resend/SendGrid in a later phase (Step 13 was skipped).
    // You could also log to DB or append to a file for manual follow-up.
    console.log("[Contact form]", { name, email, subject, message: message.slice(0, 100) });

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
