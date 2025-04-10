import axios from "axios";

// OAuth 토큰 가져오기
async function getOAuthToken() {
  try {
    console.log("OAuth 토큰 요청 시작");
    console.log("Client ID:", process.env.NEXT_PUBLIC_ORACLE_OAUTH_CLIENT_ID);
    console.log("API URL:", process.env.NEXT_PUBLIC_ORACLE_REST_API_URL);

    // Basic Auth 헤더 생성
    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_ORACLE_OAUTH_CLIENT_ID}:${process.env.NEXT_PUBLIC_ORACLE_OAUTH_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_ORACLE_REST_API_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
      }
    );

    console.log("OAuth 토큰 응답:", response.data);
    return response.data.access_token;
  } catch (error) {
    console.error("OAuth 토큰 요청 오류:", error);
    if (error.response) {
      console.error("서버 응답:", error.response.data);
      throw new Error(`인증 토큰 요청 실패: ${error.response.data.message}`);
    }
    throw new Error("인증 토큰을 가져오는데 실패했습니다.");
  }
}

// Oracle Cloud REST API 기본 설정
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ORACLE_REST_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API 요청 인터셉터
api.interceptors.request.use(async (config) => {
  try {
    const token = await getOAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    console.log("인증 헤더 설정 완료");
    return config;
  } catch (error) {
    console.error("인증 헤더 설정 오류:", error);
    return Promise.reject(error);
  }
});

// QR 코드 목록 조회
export async function getQRList() {
  try {
    console.log("QR 목록 조회 시작");
    const response = await api.get("/qr/list");
    console.log("QR 목록 조회 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("QR 목록 조회 오류:", error);
    throw new Error("QR 목록을 가져오는데 실패했습니다.");
  }
}

// QR 코드 등록
export async function registerQR(originalUrl, description = "", address = "") {
  try {
    console.log("QR 등록 시작:", { originalUrl, description, address });
    const response = await api.post("/qr/register", {
      originalUrl,
      description,
      address,
    });
    console.log("QR 등록 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("QR 등록 오류:", error);
    throw new Error("QR 등록에 실패했습니다.");
  }
}

// QR 코드 삭제
export async function deleteQR(id) {
  try {
    if (!id) {
      throw new Error("QR 코드 ID가 필요합니다.");
    }

    console.log("QR 삭제 시작:", id);
    const response = await api.delete(`/qr/delete/${id}`, {
      data: { id: id }, // id를 요청 본문으로 전송
    });
    console.log("QR 삭제 응답:", response.data);

    if (response.data && response.data.success === 1) {
      return {
        success: 1,
        message: response.data.message || "QR 코드가 삭제되었습니다.",
        status: response.data.status || 200,
      };
    } else {
      throw new Error(response.data?.message || "QR 코드 삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("QR 삭제 오류:", error);
    if (error.response) {
      console.error("서버 응답:", error.response.data);
      throw new Error(error.response.data.message || "QR 삭제에 실패했습니다.");
    }
    throw new Error("QR 삭제에 실패했습니다.");
  }
}

// URL HAUS API를 사용하여 URL 검사
async function checkUrlHaus(url) {
  try {
    console.log("URL HAUS 검사 시작:", url);
    const response = await axios.get(`https://urlhaus-api.abuse.ch/v1/url/`, {
      params: {
        url: url,
      },
    });
    console.log("URL HAUS 검사 결과:", response.data);
    return response.data;
  } catch (error) {
    console.error("URL HAUS 검사 오류:", error);
    return null;
  }
}

// QR 코드 검사
export async function inspectQR(id, scannedUrl) {
  try {
    console.log("QR 검사 시작:", { id, scannedUrl });

    // URL HAUS 검사 수행
    const urlHausResult = await checkUrlHaus(scannedUrl);
    const isMalicious =
      urlHausResult?.query_status === "ok" && urlHausResult?.threat !== "none";

    // Oracle DB에 점검 결과 저장
    const response = await api.post("/qr/inspect", {
      id,
      scannedUrl,
      isMalicious: isMalicious ? 1 : 0,
      threatType: isMalicious ? urlHausResult.threat : null,
    });

    console.log("QR 검사 성공:", response.data);
    return {
      ...response.data,
      urlHausResult: {
        isMalicious,
        threatType: urlHausResult?.threat,
        details: urlHausResult,
      },
    };
  } catch (error) {
    console.error("QR 검사 오류:", error);
    if (error.response) {
      throw new Error(error.response.data.message || "QR 검사에 실패했습니다.");
    } else if (error.request) {
      throw new Error("서버에 연결할 수 없습니다.");
    } else {
      throw new Error("요청 중 오류가 발생했습니다.");
    }
  }
}

// QR 코드 상세 정보 조회
export async function getQRDetail(id) {
  try {
    console.log("QR 상세 정보 조회 시작:", id);
    const response = await api.get(`/qr/detail/${id}`);
    console.log("QR 상세 정보 조회 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("QR 상세 정보 조회 오류:", error);
    throw new Error("QR 상세 정보를 가져오는데 실패했습니다.");
  }
}
