import { createQRCodesTable } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("=== QR 코드 테이블 초기화 시작 ===");
    await createQRCodesTable();
    console.log("=== QR 코드 테이블 초기화 완료 ===");

    res.status(200).json({
      success: true,
      message: "QR 코드 테이블이 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    console.error("QR 코드 테이블 초기화 실패:", error);
    res.status(500).json({
      success: false,
      message: "QR 코드 테이블 생성 실패",
      error: error.message,
    });
  }
}
