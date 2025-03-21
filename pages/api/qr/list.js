import { listQRCodes } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  try {
    const qrCodes = await listQRCodes();
    res.status(200).json(qrCodes);
  } catch (error) {
    console.error("QR 코드 목록 조회 API 오류:", error);
    res
      .status(500)
      .json({ error: "QR 코드 목록 조회 중 오류가 발생했습니다." });
  }
}
