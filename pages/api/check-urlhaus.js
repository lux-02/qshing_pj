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
    // URL HAUS API 호출
    const response = await axios.post(
      "https://urlhaus-api.abuse.ch/v1/url/",
      `url=${url}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // 전체 응답 데이터 구조 콘솔에 출력
    console.log("URLhaus API 응답 전체 데이터:");
    console.log(JSON.stringify(response.data, null, 2));

    // 응답 처리
    if (
      response.data.query_status === "no_results" ||
      response.data.query_status === "invalid_url"
    ) {
      return res.status(200).json({
        query_status: "ok",
        threat: "none",
        message: "URL HAUS 데이터베이스에서 위협이 발견되지 않았습니다.",
      });
    }

    // 위협이 발견된 경우
    const { url_status, threat, threat_type, tags, id } = response.data;

    // id가 있는 경우만 reference URL 생성
    const referenceUrl = id ? `https://urlhaus.abuse.ch/url/${id}/` : null;

    return res.status(200).json({
      query_status: "ok",
      url_status,
      threat: threat || "malicious", // threat 값이 없으면 malicious로 처리
      threat_type: threat_type || "unknown", // threat_type이 없으면 unknown으로 처리
      tags: tags || [],
      message: "해당 URL은 위협으로 분류되었습니다.",
      reference: referenceUrl,
    });
  } catch (error) {
    console.error("URL HAUS 검사 오류:", error.message);
    return res.status(500).json({
      error: "URL 검사에 실패했습니다.",
      details: error.response?.data,
    });
  }
}
