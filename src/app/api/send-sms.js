import twilio from "twilio";

export async function POST(req) {
  const { to, body } = await req.json();
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Twilio Error:", err);
    return new Response(JSON.stringify({ error: "Failed to send SMS" }), { status: 500 });
  }
}
