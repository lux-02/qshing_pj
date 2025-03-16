import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { originalUrl, description, address } = req.body;

    if (!originalUrl || !description || !address) {
      console.log("Received data:", req.body);
      return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    const qrCode = new QRCode({
      originalUrl,
      description,
      address,
    });

    await qrCode.save();

    res.status(201).json({
      success: true,
      message: "QR 코드가 성공적으로 등록되었습니다.",
      data: qrCode,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
}
