import { getConnection } from "../../../lib/oracle";

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
    let result;

    try {
      result = await connection.execute(
        `SELECT ID, DESCRIPTION, ADDRESS, ORIGINAL_URL, LAST_SCANNED_URL, LAST_SCANNED_AT, IS_COMPROMISED
         FROM QR_CODES 
         WHERE ID = :1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
      }

      const row = result.rows[0];
      const qrCode = {
        ID: row[0],
        DESCRIPTION: row[1],
        ADDRESS: row[2],
        ORIGINAL_URL: row[3],
        LAST_SCANNED_URL: row[4],
        LAST_SCANNED_AT: row[5],
        IS_COMPROMISED: row[6],
      };

      return res.status(200).json(qrCode);
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error("Detail fetch error:", error);
    return res.status(500).json({
      message: "QR 코드 정보를 가져오는데 실패했습니다.",
      error: error.message,
    });
  }
}
