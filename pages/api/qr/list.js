import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "허용되지 않는 메소드입니다." });
  }

  try {
    await dbConnect();

    const qrCodes = await QRCode.find({}).sort({ createdAt: -1 }).lean();

    res.status(200).json(qrCodes);
  } catch (error) {
    console.error("QR 코드 목록 조회 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
}
