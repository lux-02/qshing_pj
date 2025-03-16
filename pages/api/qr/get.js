import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "QR 코드 ID가 필요합니다." });
    }

    const qrCode = await QRCode.findById(id);

    if (!qrCode) {
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    res.status(200).json(qrCode);
  } catch (error) {
    console.error("QR 코드 조회 에러:", error);
    res.status(500).json({ message: "QR 코드 조회 중 오류가 발생했습니다." });
  }
}
