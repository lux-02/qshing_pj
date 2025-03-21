import axios from "axios";
import { getConnection } from "./oracle";

export async function scanQRCodes() {
  let connection;
  try {
    connection = await getConnection();

    // 모든 QR 코드 조회
    const result = await connection.execute(
      `SELECT 
        id, original_url, description, address,
        last_scanned_url, last_scanned_at, is_compromised
      FROM qr_codes`
    );

    for (const qrCode of result.rows) {
      try {
        const response = await axios.get(qrCode.ORIGINAL_URL, {
          maxRedirects: 5,
          timeout: 5000,
          validateStatus: null,
        });

        const finalUrl =
          response.request.res.responseUrl || qrCode.ORIGINAL_URL;
        const isCompromised = finalUrl !== qrCode.ORIGINAL_URL;

        // QR 코드 스캔 정보 업데이트
        await connection.execute(
          `UPDATE qr_codes 
           SET last_scanned_url = :1,
               last_scanned_at = CURRENT_TIMESTAMP,
               is_compromised = :2
           WHERE id = :3`,
          [finalUrl, isCompromised ? 1 : 0, qrCode.ID],
          { autoCommit: true }
        );

        if (isCompromised) {
          // TODO: 여기에 알림 로직 추가 (이메일, SMS 등)
          console.log(`[경고] QR 코드 변조 감지: ${qrCode.DESCRIPTION}`);
          console.log(`원본 URL: ${qrCode.ORIGINAL_URL}`);
          console.log(`변경된 URL: ${finalUrl}`);
        }
      } catch (error) {
        console.error(
          `QR 코드 스캔 실패 (${qrCode.DESCRIPTION}):`,
          error.message
        );

        // 스캔 실패 정보 업데이트
        await connection.execute(
          `UPDATE qr_codes 
           SET last_scanned_at = CURRENT_TIMESTAMP
           WHERE id = :1`,
          [qrCode.ID],
          { autoCommit: true }
        );
      }
    }
  } catch (error) {
    console.error("QR 코드 스캔 작업 실패:", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("연결 종료 실패:", error);
      }
    }
  }
}
