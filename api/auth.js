import crypto from "crypto";

export default function handler(req, res) {
  try {
    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const secretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return res.status(500).json({ error: "Missing API keys" });
    }

    // Current timestamp in seconds
    const time = Math.floor(Date.now() / 1000);

    // Generate signature using SHA-256
    const signature = crypto
      .createHash("sha256")
      .update(publicKey + secretKey + time)
      .digest("hex");

    res.status(200).json({
      public_key: publicKey,
      signature,
      expires: time
    });
  } catch (err) {
    res.status(500).json({ error: "Auth error" });
  }
}
