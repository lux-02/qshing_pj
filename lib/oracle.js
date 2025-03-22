import axios from "axios";

// Oracle REST API 설정
const ORACLE_REST_API_URL = process.env.ORACLE_REST_API_URL;
const ORACLE_OAUTH_CLIENT_ID = process.env.ORACLE_OAUTH_CLIENT_ID;
const ORACLE_OAUTH_CLIENT_SECRET = process.env.ORACLE_OAUTH_CLIENT_SECRET;

// OAuth 토큰을 가져오는 함수
async function getAccessToken() {
  try {
    console.log("OAuth 토큰 요청 시작");
    console.log("Client ID:", ORACLE_OAUTH_CLIENT_ID);
    console.log("API URL:", ORACLE_REST_API_URL);

    const response = await axios.post(
      `${ORACLE_REST_API_URL}/oauth/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: ORACLE_OAUTH_CLIENT_ID,
          password: ORACLE_OAUTH_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("OAuth 토큰 응답:", response.data);
    return response.data.access_token;
  } catch (error) {
    console.error("OAuth 토큰 발급 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("인증 토큰을 가져오는데 실패했습니다.");
  }
}

// 기본 axios 인스턴스 생성
const api = axios.create({
  baseURL: ORACLE_REST_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 요청 인터셉터 추가
api.interceptors.request.use(async (config) => {
  try {
    console.log("API 요청 시작:", config.url);
    const token = await getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    console.log("인증 헤더 설정 완료");
    return config;
  } catch (error) {
    console.error("인터셉터 오류:", error);
    return Promise.reject(error);
  }
});

// QR 코드 목록 조회
export async function getQRList() {
  try {
    console.log("QR 목록 조회 시작");
    const response = await api.get("/qr/list");
    console.log("QR 목록 조회 성공");
    return response.data;
  } catch (error) {
    console.error("QR 목록 조회 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("QR 목록을 가져오는데 실패했습니다.");
  }
}

// QR 코드 상세 정보 조회
export async function getQRDetail(qrId) {
  try {
    console.log("QR 상세 정보 조회 시작:", qrId);
    const response = await api.get(`/qr/detail/${qrId}`);
    console.log("QR 상세 정보 조회 성공");
    return response.data;
  } catch (error) {
    console.error("QR 상세 정보 조회 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("QR 상세 정보를 가져오는데 실패했습니다.");
  }
}

// QR 코드 검사
export async function inspectQR(qrId, scannedUrl) {
  try {
    console.log("QR 검사 시작:", { qrId, scannedUrl });
    const response = await api.post("/qr/inspect", {
      qrId,
      scannedUrl,
    });
    console.log("QR 검사 성공");
    return response.data;
  } catch (error) {
    console.error("QR 검사 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("QR 검사에 실패했습니다.");
  }
}

// QR 코드 등록
export async function registerQR(originalUrl) {
  try {
    console.log("QR 등록 시작:", originalUrl);
    const response = await api.post("/qr/register", {
      originalUrl,
    });
    console.log("QR 등록 성공");
    return response.data;
  } catch (error) {
    console.error("QR 등록 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("QR 등록에 실패했습니다.");
  }
}

// QR 코드 삭제
export async function deleteQR(qrId) {
  try {
    console.log("QR 삭제 시작:", qrId);
    const response = await api.delete(`/qr/delete/${qrId}`);
    console.log("QR 삭제 성공");
    return response.data;
  } catch (error) {
    console.error("QR 삭제 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("QR 삭제에 실패했습니다.");
  }
}
