import oracledb from "oracledb";
import { getConnection } from "../../../lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { description, address, originalUrl } = req.body;

    if (!description || !address || !originalUrl) {
      return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    const connection = await getConnection();
    let result;

    try {
      result = await connection.execute(
        `BEGIN
          INSERT INTO QR_CODES (ID, DESCRIPTION, ADDRESS, ORIGINAL_URL, CREATED_AT)
          VALUES (QR_CODES_SEQ.NEXTVAL, :1, :2, :3, SYSDATE)
          RETURNING ID INTO :4;
        END;`,
        [
          description,
          address,
          originalUrl,
          { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        ],
        { autoCommit: true }
      );

      const qrId = result.outBinds[0];
      return res.status(201).json({
        message: "QR 코드가 등록되었습니다.",
        qrId: qrId,
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "QR 코드 등록 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
