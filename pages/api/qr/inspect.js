import { inspectQR } from "@/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { qrId, scannedUrl } = req.body;

  if (!qrId || !scannedUrl) {
    return res.status(400).json({ error: "QR ID와 스캔된 URL이 필요합니다." });
  }

  try {
    const result = await inspectQR(qrId, scannedUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error("QR 코드 검사 API 오류:", error);
    res.status(500).json({ error: "QR 코드 검사 중 오류가 발생했습니다." });
  }
}
