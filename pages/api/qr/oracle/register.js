import { getConnection } from "../../../app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "허용되지 않는 요청 방법입니다." });
  }

  try {
    const { originalUrl, description, address } = req.body;
    const connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO qr_codes (id, original_url, description, address)
       VALUES (SYS_GUID(), :1, :2, :3)`,
      [originalUrl, description, address],
      { autoCommit: true }
    );

    await connection.close();

    res.status(200).json({
      success: true,
      message: "QR 코드가 등록되었습니다.",
      id: result.rowsAffected[0],
    });
  } catch (error) {
    console.error("Oracle registration error:", error);
    res.status(500).json({ message: "등록 중 오류가 발생했습니다." });
  }
}
