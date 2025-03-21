import { getConnection } from "../../../app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "허용되지 않는 요청 방법입니다." });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "QR 코드 ID가 필요합니다." });
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

    // QR 코드 삭제
    await connection.execute("DELETE FROM qr_codes WHERE id = :1", [id], {
      autoCommit: true,
    });
    await connection.close();

    res.status(200).json({ message: "QR 코드가 삭제되었습니다." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
}
