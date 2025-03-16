import { scanQRCodes } from "../../../app/lib/scanner";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "허용되지 않는 메소드입니다." });
  }

  try {
    await scanQRCodes();
    res.status(200).json({ message: "QR 코드 스캔이 완료되었습니다." });
  } catch (error) {
    console.error("QR 코드 스캔 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
}
