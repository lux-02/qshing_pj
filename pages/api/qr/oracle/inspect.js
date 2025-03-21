import { getConnection } from "@/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { qrId } = req.query;
  if (!qrId) {
    return res.status(400).json({ message: "QR 코드 ID가 필요합니다." });
  }

  const { scannedUrl } = req.body;
  if (!scannedUrl) {
    return res.status(400).json({ message: "스캔된 URL이 필요합니다." });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ORIGINAL_URL FROM QR_CODES WHERE ID = :1`,
      [qrId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    const originalUrl = result.rows[0][0];

    // TODO: 실제 위변조 검사 로직 구현
    const isCompromised = false;

    // 점검 결과 업데이트
    await connection.execute(
      `UPDATE QR_CODES 
       SET LAST_SCANNED_URL = :1, 
           LAST_SCANNED_AT = SYSDATE, 
           IS_COMPROMISED = :2 
       WHERE ID = :3`,
      [scannedUrl, isCompromised ? 1 : 0, qrId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      isCompromised,
      lastScannedUrl: scannedUrl,
      lastScannedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("QR 코드 점검 중 오류 발생:", error);
    return res.status(500).json({
      success: false,
      message: "QR 코드 점검 중 오류가 발생했습니다.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Connection closing error:", error);
      }
    }
  }
}
