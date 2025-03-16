import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "허용되지 않는 메소드입니다." });
  }

  try {
    await dbConnect();

    const { originalUrl, description, location } = req.body;

    if (!originalUrl || !description || !location) {
      return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    const qrCode = new QRCode({
      originalUrl,
      description,
      location,
    });

    await qrCode.save();

    res
      .status(201)
      .json({ message: "QR 코드가 성공적으로 등록되었습니다.", data: qrCode });
  } catch (error) {
    console.error("QR 코드 등록 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
}
