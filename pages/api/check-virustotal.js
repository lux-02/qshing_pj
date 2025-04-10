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
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    console.log("VirusTotal API 요청:", formattedUrl);

    // IP 주소인 경우 IP 분석 API를 사용
    const isIPAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(url);
    let response;

    if (isIPAddress) {
      // IP 주소 분석
      response = await axios.get(
        `https://www.virustotal.com/api/v3/ip_addresses/${url}`,
        {
          headers: {
            "x-apikey": process.env.VIRUSTOTAL_API_KEY,
          },
        }
      );

      // 전체 응답 데이터 구조 콘솔에 출력
      console.log("VirusTotal IP 응답 전체 데이터:");
      console.log(JSON.stringify(response.data, null, 2));

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;
      const lastAnalysisResults = attributes.last_analysis_results;

      // IP 주소의 악성 여부를 판단할 때는 last_analysis_results를 확인
      const maliciousResults = Object.entries(lastAnalysisResults)
        .filter(([_, result]) => result.category === "malicious")
        .map(([engine, result]) => ({
          engine,
          result: result.result,
        }));

      const isMalicious = maliciousResults.length > 0;

      return res.status(200).json({
        query_status: "ok",
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? "악성 IP 주소로 판단되었습니다."
          : "안전한 IP 주소입니다.",
        analysis_stats: {
          ...stats,
          malicious_count: maliciousResults.length,
          malicious_details: maliciousResults,
        },
        analysis_results: lastAnalysisResults,
        virustotal_url: `https://www.virustotal.com/gui/ip-address/${url}`,
      });
    } else {
      // URL 분석
      const submitResponse = await axios.post(
        "https://www.virustotal.com/api/v3/urls",
        { url: formattedUrl },
        {
          headers: {
            "x-apikey": process.env.VIRUSTOTAL_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // URL 제출 응답 콘솔에 출력
      console.log("VirusTotal URL 제출 응답:");
      console.log(JSON.stringify(submitResponse.data, null, 2));

      const analysisId = submitResponse.data.data.id;
      console.log("VirusTotal 분석 ID:", analysisId);

      response = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            "x-apikey": process.env.VIRUSTOTAL_API_KEY,
          },
        }
      );

      // 분석 결과 응답 콘솔에 출력
      console.log("VirusTotal URL 분석 결과 전체 데이터:");
      console.log(JSON.stringify(response.data, null, 2));

      const attributes = response.data.data.attributes;
      const stats = attributes.stats;
      const results = attributes.results;
      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      return res.status(200).json({
        query_status: "ok",
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? "악성 URL로 판단되었습니다."
          : "안전한 URL입니다.",
        analysis_stats: stats,
        analysis_results: results,
        virustotal_url: `https://www.virustotal.com/gui/url/${analysisId}`,
      });
    }
  } catch (error) {
    console.error(
      "VirusTotal 검사 오류:",
      error.response?.data || error.message
    );

    // URL을 찾을 수 없는 경우
    if (error.response?.status === 404) {
      return res.status(200).json({
        query_status: "ok",
        threat: "unknown",
        message: "해당 URL에 대한 정보가 없습니다.",
        analysis_stats: {
          malicious: 0,
          suspicious: 0,
          harmless: 0,
          undetected: 0,
        },
        virustotal_url: `https://www.virustotal.com/gui/search/${encodeURIComponent(
          url
        )}`,
      });
    }

    // API 키 관련 오류
    if (error.response?.status === 401) {
      return res.status(500).json({
        error: "VirusTotal API 키가 유효하지 않습니다.",
        details: error.response?.data,
      });
    }

    // 기타 오류
    return res.status(500).json({
      error: error.response?.data?.message || "URL 검사에 실패했습니다.",
      details: error.response?.data,
    });
  }
}
