import dbConnect from "../../../app/lib/mongodb";
import QRCode from "../../../app/models/QRCode";

function normalizeUrl(urlString) {
  try {
    // URL이 프로토콜로 시작하지 않으면 https:// 추가
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
      urlString = "https://" + urlString;
    }

    const url = new URL(urlString);

    // 기본 정규화 단계:
    // 1. 호스트네임을 소문자로 변환하고 'www.' 제거
    let hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    // 2. pathname을 소문자로 변환하고 마지막 슬래시 제거
    let pathname = url.pathname.toLowerCase().replace(/\/$/, "") || "/";

    // 3. 쿼리 파라미터 정렬 (있는 경우)
    let search = "";
    if (url.search) {
      const searchParams = new URLSearchParams(url.search);
      const sortedParams = Array.from(searchParams.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      search = "?" + new URLSearchParams(sortedParams).toString();
    }

    // 4. 해시 제거 (fragment)
    // 최종 URL 조합
    const normalizedUrl = hostname + pathname + search;

    console.log("Normalizing URL:", {
      original: urlString,
      hostname,
      pathname,
      search,
      normalized: normalizedUrl,
    });

    return normalizedUrl;
  } catch (error) {
    console.error("URL normalization error:", error);
    // 기본적인 정규화 시도
    return urlString
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "허용되지 않는 요청 방법입니다." });
  }

  try {
    await dbConnect();

    const { qrId, scannedUrl } = req.body;

    if (!qrId || !scannedUrl) {
      return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    const qrCode = await QRCode.findById(qrId);

    if (!qrCode) {
      return res.status(404).json({ message: "QR 코드를 찾을 수 없습니다." });
    }

    const normalizedOriginal = normalizeUrl(qrCode.originalUrl);
    const normalizedScanned = normalizeUrl(scannedUrl);

    // 디버깅을 위한 상세 로그
    console.log("URL Comparison:", {
      originalUrl: qrCode.originalUrl,
      normalizedOriginal,
      scannedUrl,
      normalizedScanned,
      isEqual: normalizedOriginal === normalizedScanned,
    });

    const isCompromised = normalizedOriginal !== normalizedScanned;

    // QR 코드 정보 업데이트
    const updateData = {
      lastScannedAt: new Date(),
      lastScannedUrl: scannedUrl,
      isCompromised,
      normalizedOriginalUrl: normalizedOriginal, // 정규화된 URL 저장 (선택사항)
      normalizedScannedUrl: normalizedScanned, // 정규화된 URL 저장 (선택사항)
    };

    await QRCode.findByIdAndUpdate(qrId, updateData);

    res.status(200).json({
      success: true,
      isCompromised,
      normalizedOriginal,
      normalizedScanned,
      message: isCompromised
        ? "QR 코드가 변조되었습니다."
        : "QR 코드가 안전합니다.",
    });
  } catch (error) {
    console.error("Inspection error:", error);
    res.status(500).json({
      message: "점검 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
