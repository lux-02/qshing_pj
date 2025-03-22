import { registerQR } from "@/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "원본 URL이 필요합니다." });
  }

  try {
    const result = await registerQR(originalUrl);
    res.status(201).json(result);
  } catch (error) {
    console.error("QR 코드 등록 API 오류:", error);
    res.status(500).json({ error: "QR 코드 등록 중 오류가 발생했습니다." });
  }
}
