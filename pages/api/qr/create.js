import { createQRCode } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  try {
    const { description, address, originalUrl } = req.body;

    // 필수 필드 검증
    if (!description || !address || !originalUrl) {
      return res.status(400).json({
        error:
          "필수 필드가 누락되었습니다. (description, address, originalUrl)",
      });
    }

    const qrCode = await createQRCode({ description, address, originalUrl });
    res.status(201).json(qrCode);
  } catch (error) {
    console.error("QR 코드 생성 API 오류:", error);
    res.status(500).json({ error: "QR 코드 생성 중 오류가 발생했습니다." });
  }
}
