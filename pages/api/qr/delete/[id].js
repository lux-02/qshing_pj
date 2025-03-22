import { deleteQR } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "QR ID가 필요합니다.",
        success: 0,
        message: "QR ID가 필요합니다.",
        status: 400,
      });
    }

    const result = await deleteQR(id);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("QR 코드 삭제 API 오류:", error);
    return res.status(500).json({
      error: error.message,
      success: 0,
      message: error.message,
      status: 500,
    });
  }
}
