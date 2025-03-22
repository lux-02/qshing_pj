import { inspectQR } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id, scannedUrl } = req.body;
    console.log("요청 데이터:", { id, scannedUrl });

    if (!id || !scannedUrl) {
      return res.status(400).json({
        error: "QR 코드 ID와 스캔된 URL이 필요합니다.",
        success: 0,
        message: "QR 코드 ID와 스캔된 URL이 필요합니다.",
        status: 400,
      });
    }

    const result = await inspectQR(id, scannedUrl);
    console.log("QR 코드 점검 결과:", result);

    return res.status(result.status).json({
      success: result.success ? 1 : 0,
      message: result.message,
      status: result.status,
    });
  } catch (error) {
    console.error("QR 점검 중 오류 발생:", error);
    return res.status(500).json({
      error: error.message || "QR 코드 점검 중 오류가 발생했습니다.",
      success: 0,
      message: error.message || "QR 코드 점검 중 오류가 발생했습니다.",
      status: 500,
    });
  }
}
