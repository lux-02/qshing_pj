export async function inspectQRCode(id, scannedUrl) {
  try {
    if (!id) {
      throw new Error("QR 코드 ID가 필요합니다.");
    }

    if (!scannedUrl) {
      throw new Error("스캔된 URL이 필요합니다.");
    }

    console.log("QR 점검 API 호출 준비:", { id, scannedUrl });

    const requestBody = { scannedUrl };
    console.log("요청 본문:", requestBody);

    const url = `/api/qr/oracle/inspect?id=${encodeURIComponent(id)}`;
    console.log("요청 URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("API 응답 상태:", response.status);
    const data = await response.json();
    console.log("API 응답 데이터:", data);

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "QR 코드 점검에 실패했습니다."
      );
    }

    return data;
  } catch (error) {
    console.error("QR 점검 중 오류 발생:", error);
    throw error;
  }
}
