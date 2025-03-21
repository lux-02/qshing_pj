import { updateQRCodeScan } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { id } = req.query;
  const { scannedUrl } = req.body;

  if (!id) {
    return res.status(400).json({ error: "QR 코드 ID가 필요합니다." });
  }

  if (!scannedUrl) {
    return res.status(400).json({ error: "스캔된 URL이 필요합니다." });
  }

  try {
    await updateQRCodeScan(id, scannedUrl);
    res.status(200).json({ message: "스캔 정보가 업데이트되었습니다." });
  } catch (error) {
    console.error("QR 코드 스캔 정보 업데이트 API 오류:", error);
    res
      .status(500)
      .json({ error: "QR 코드 스캔 정보 업데이트 중 오류가 발생했습니다." });
  }
}
