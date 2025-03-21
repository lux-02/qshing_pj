import { getConnection } from "@/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { originalUrl, description, address } = req.body;

  if (!originalUrl || !description || !address) {
    return res.status(400).json({
      success: false,
      message: "모든 필드를 입력해주세요.",
    });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO QR_CODES (ID, ORIGINAL_URL, DESCRIPTION, ADDRESS, CREATED_AT)
       VALUES (QR_CODES_SEQ.NEXTVAL, :1, :2, :3, SYSDATE)
       RETURNING ID INTO :4`,
      [
        originalUrl,
        description,
        address,
        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      id: result.outBinds[0],
      message: "QR 코드가 등록되었습니다.",
    });
  } catch (error) {
    console.error("QR 코드 등록 중 오류 발생:", error);
    return res.status(500).json({
      success: false,
      message: "QR 코드 등록 중 오류가 발생했습니다.",
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
