import { deleteQR } from "@/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { qrId } = req.query;

  if (!qrId) {
    return res.status(400).json({ error: "QR ID가 필요합니다." });
  }

  try {
    const result = await deleteQR(qrId);
    res.status(200).json(result);
  } catch (error) {
    console.error("QR 코드 삭제 API 오류:", error);
    res.status(500).json({ error: "QR 코드 삭제 중 오류가 발생했습니다." });
  }
}
