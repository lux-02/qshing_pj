import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "허용되지 않는 요청 방법입니다." });
  }

  try {
    await dbConnect();
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "QR 코드 ID가 필요합니다." });
    }

    const deletedQR = await QRCode.findByIdAndDelete(id);

    if (!deletedQR) {
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "QR 코드가 삭제되었습니다." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "삭제 중 오류가 발생했습니다." });
  }
}
