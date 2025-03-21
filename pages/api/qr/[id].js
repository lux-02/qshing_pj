import { getQRCode, updateQRCode, deleteQRCode } from "@/app/lib/oracle";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "QR 코드 ID가 필요합니다." });
  }

  try {
    switch (req.method) {
      case "GET":
        const qrCode = await getQRCode(id);
        if (!qrCode) {
          return res
            .status(404)
            .json({ error: "해당 QR 코드를 찾을 수 없습니다." });
        }
        return res.status(200).json(qrCode);

      case "PUT":
        const { description, address, originalUrl } = req.body;

        // 필수 필드 검증
        if (!description || !address || !originalUrl) {
          return res.status(400).json({
            error:
              "필수 필드가 누락되었습니다. (description, address, originalUrl)",
          });
        }

        const updatedQRCode = await updateQRCode(id, {
          description,
          address,
          originalUrl,
        });

        if (!updatedQRCode) {
          return res
            .status(404)
            .json({ error: "해당 QR 코드를 찾을 수 없습니다." });
        }

        return res.status(200).json(updatedQRCode);

      case "DELETE":
        await deleteQRCode(id);
        return res.status(204).end();

      default:
        return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
    }
  } catch (error) {
    console.error("QR 코드 API 오류:", error);
    res.status(500).json({ error: "QR 코드 처리 중 오류가 발생했습니다." });
  }
}
