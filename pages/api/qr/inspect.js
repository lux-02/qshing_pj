import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { qrId, scannedUrl } = req.body;

    if (!qrId || !scannedUrl) {
      return res.status(400).json({
        success: false,
        message: "QR 코드 ID와 스캔된 URL이 필요합니다.",
      });
    }

    const qrCode = await QRCode.findById(qrId);

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR 코드를 찾을 수 없습니다.",
      });
    }

    // QR 코드 점검 정보 업데이트
    qrCode.lastScannedAt = new Date();
    qrCode.lastScannedUrl = scannedUrl;
    qrCode.isCompromised = qrCode.originalUrl !== scannedUrl;

    await qrCode.save();

    res.status(200).json({
      success: true,
      message: "QR 코드 점검이 완료되었습니다.",
      data: qrCode,
    });
  } catch (error) {
    console.error("QR 코드 점검 에러:", error);
    res.status(500).json({
      success: false,
      message: "QR 코드 점검 중 오류가 발생했습니다.",
    });
  }
}
