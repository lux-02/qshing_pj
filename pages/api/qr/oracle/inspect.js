import { getConnection } from "../../../app/lib/oracle";

function normalizeUrl(urlString) {
  // 기존 normalizeUrl 함수와 동일
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "허용되지 않는 요청 방법입니다." });
  }

  try {
    const { qrId, scannedUrl } = req.body;
    const connection = await getConnection();

    // QR 코드 정보 조회
    const result = await connection.execute(
      "SELECT * FROM qr_codes WHERE id = :1",
      [qrId]
    );

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    const qrCode = result.rows[0];
    const normalizedOriginal = normalizeUrl(qrCode.ORIGINAL_URL);
    const normalizedScanned = normalizeUrl(scannedUrl);

    const isCompromised = normalizedOriginal !== normalizedScanned;

    // QR 코드 정보 업데이트
    await connection.execute(
      `UPDATE qr_codes 
       SET last_scanned_at = CURRENT_TIMESTAMP,
           last_scanned_url = :1,
           is_compromised = :2,
           normalized_original_url = :3,
           normalized_scanned_url = :4
       WHERE id = :5`,
      [
        scannedUrl,
        isCompromised ? 1 : 0,
        normalizedOriginal,
        normalizedScanned,
        qrId,
      ],
      { autoCommit: true }
    );

    await connection.close();

    res.status(200).json({
      success: true,
      isCompromised,
      normalizedOriginal,
      normalizedScanned,
      message: isCompromised
        ? "QR 코드가 변조되었습니다."
        : "QR 코드가 안전합니다.",
    });
  } catch (error) {
    console.error("Oracle inspection error:", error);
    res.status(500).json({ message: "점검 중 오류가 발생했습니다." });
  }
}
