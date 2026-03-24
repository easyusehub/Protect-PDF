import crypto from "crypto";

export default function handler(req, res) {

  const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
  const secretKey = process.env.ILOVEPDF_SECRET_KEY;

  const time = Math.floor(Date.now() / 1000);

  const signature = crypto
    .createHash("sha256")
    .update(publicKey + secretKey + time)
    .digest("hex");

  res.status(200).json({
    public_key: publicKey,
    signature: signature,
    expires: time
  });
}
