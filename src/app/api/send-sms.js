import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, body } = req.body;

  // Make sure you replaced YOUR_AUTH_TOKEN with the real one
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    console.log("Sending SMS to:", to);
    console.log("Message body:", body);

    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Twilio Error:", err);
    res.status(500).json({ error: "Failed to send SMS" });
  }
}
