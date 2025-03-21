import { getConnection } from "../../../app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "허용되지 않는 요청 방법입니다." });
  }

  try {
    const { id, originalUrl, description, address } = req.body;

    if (!id || !originalUrl || !description || !address) {
      return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    const connection = await getConnection();

    // 먼저 QR 코드가 존재하는지 확인
    const checkResult = await connection.execute(
      "SELECT id FROM qr_codes WHERE id = :1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    // QR 코드 업데이트
    await connection.execute(
      `UPDATE qr_codes 
       SET original_url = :1,
           description = :2,
           address = :3
       WHERE id = :4`,
      [originalUrl, description, address, id],
      { autoCommit: true }
    );

    // 업데이트된 QR 코드 조회
    const result = await connection.execute(
      `SELECT 
        id, original_url, description, address,
        last_scanned_url, last_scanned_at, is_compromised,
        created_at, updated_at
      FROM qr_codes 
      WHERE id = :1`,
      [id]
    );
    await connection.close();

    res.status(200).json({
      success: true,
      message: "QR 코드가 성공적으로 수정되었습니다.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
}
