import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL이 필요합니다." });
  }

  try {
    // URL이 http:// 또는 https://로 시작하지 않으면 추가
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    console.log("URL HAUS API 요청:", formattedUrl);

    const response = await axios.post(
      `https://urlhaus-api.abuse.ch/v1/url/`,
      new URLSearchParams({
        url: formattedUrl,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("URL HAUS API 응답:", response.data);

    // 응답 상태에 따른 처리
    if (response.data.query_status === "invalid_url") {
      return res.status(400).json({
        error: "잘못된 URL 형식입니다.",
        query_status: response.data.query_status,
      });
    }

    if (response.data.query_status === "no_results") {
      return res.status(200).json({
        query_status: "ok",
        threat: "none",
        message: "안전한 URL입니다.",
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("URL HAUS 검사 오류:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.message || "URL 검사에 실패했습니다.",
      details: error.response?.data,
    });
  }
}
