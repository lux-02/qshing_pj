import { getConnection } from "../../../app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "QR 코드 ID가 필요합니다." });
    }

    const connection = await getConnection();
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

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    const qrCode = result.rows[0];
    res.status(200).json(qrCode);
  } catch (error) {
    console.error("Get QR code error:", error);
    res.status(500).json({ message: error.message });
  }
}
