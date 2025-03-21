import { getConnection } from "../../../lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { scannedUrl } = req.body;

  if (!id) {
    return res.status(400).json({ message: "QR 코드 ID가 필요합니다." });
  }

  if (!scannedUrl) {
    return res.status(400).json({ message: "스캔된 URL이 필요합니다." });
  }

  let connection;
  try {
    connection = await getConnection();

    // QR 코드 정보 조회
    const result = await connection.execute(
      `SELECT ID, ORIGINAL_URL FROM QR_CODES WHERE ID = :1`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "QR 코드를 찾을 수 없습니다.",
      });
    }

    const originalUrl = result.rows[0][1];
    const isCompromised = originalUrl !== scannedUrl;

    // 스캔 결과 업데이트
    await connection.execute(
      `UPDATE QR_CODES 
       SET LAST_SCANNED_URL = :1, 
           LAST_SCANNED_AT = SYSDATE,
           IS_COMPROMISED = :2
       WHERE ID = :3`,
      [scannedUrl, isCompromised ? 1 : 0, id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "점검이 완료되었습니다.",
      isCompromised,
    });
  } catch (error) {
    console.error("Inspection error:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }
    return res.status(500).json({
      success: false,
      message: "점검 중 오류가 발생했습니다.",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Connection close error:", closeError);
      }
    }
  }
}
