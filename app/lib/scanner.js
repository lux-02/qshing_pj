import axios from "axios";
import dbConnect from "./mongodb";
import QRCode from "../models/QRCode";

export async function scanQRCodes() {
  try {
    await dbConnect();

    const qrCodes = await QRCode.find({});

    for (const qrCode of qrCodes) {
      try {
        const response = await axios.get(qrCode.originalUrl, {
          maxRedirects: 5,
          timeout: 5000,
          validateStatus: null,
        });

        const finalUrl = response.request.res.responseUrl || qrCode.originalUrl;
        const isCompromised = finalUrl !== qrCode.originalUrl;

        await QRCode.findByIdAndUpdate(qrCode._id, {
          $set: {
            lastScannedUrl: finalUrl,
            lastScannedAt: new Date(),
            isCompromised,
          },
          $push: {
            scans: {
              scannedUrl: finalUrl,
              scannedAt: new Date(),
              isCompromised,
            },
          },
        });

        if (isCompromised) {
          // TODO: 여기에 알림 로직 추가 (이메일, SMS 등)
          console.log(`[경고] QR 코드 변조 감지: ${qrCode.description}`);
          console.log(`원본 URL: ${qrCode.originalUrl}`);
          console.log(`변경된 URL: ${finalUrl}`);
        }
      } catch (error) {
        console.error(
          `QR 코드 스캔 실패 (${qrCode.description}):`,
          error.message
        );

        await QRCode.findByIdAndUpdate(qrCode._id, {
          $set: {
            lastScannedAt: new Date(),
          },
          $push: {
            scans: {
              scannedAt: new Date(),
              error: error.message,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("QR 코드 스캔 작업 실패:", error);
  }
}
