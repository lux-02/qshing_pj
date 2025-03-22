import axios from "axios";

// Oracle REST API 설정
const ORACLE_REST_API_URL = process.env.NEXT_PUBLIC_ORACLE_REST_API_URL;
const ORACLE_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_ORACLE_OAUTH_CLIENT_ID;
const ORACLE_OAUTH_CLIENT_SECRET =
  process.env.NEXT_PUBLIC_ORACLE_OAUTH_CLIENT_SECRET;

// OAuth 토큰을 가져오는 함수
async function getAccessToken() {
  try {
    if (
      !ORACLE_REST_API_URL ||
      !ORACLE_OAUTH_CLIENT_ID ||
      !ORACLE_OAUTH_CLIENT_SECRET
    ) {
      throw new Error(
        "Oracle API 설정이 누락되었습니다. 환경 변수를 확인해주세요."
      );
    }

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
    console.log("QR 목록 조회 성공:", response.data);
    return response.data.items || [];
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
export async function getQRDetail(id) {
  try {
    console.log("QR 상세 정보 조회 시작:", id);
    const response = await api.get(`/qr/detail/${id}`);
    console.log("QR 상세 정보 조회 성공:", response.data);
    return response.data.items?.[0] || null;
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
export async function inspectQR(id, scannedUrl) {
  try {
    if (!id || !scannedUrl) {
      throw new Error("QR 코드 ID와 스캔된 URL이 필요합니다.");
    }

    console.log("QR 검사 시작:", { id, scannedUrl });
    const response = await api.post(`/qr/inspect`, {
      id,
      scannedUrl,
    });

    console.log("QR 검사 성공:", response.data);

    // 응답이 없거나 빈 객체인 경우에도 성공으로 처리
    if (!response.data || Object.keys(response.data).length === 0) {
      return {
        success: true,
        message: "QR 코드 점검이 완료되었습니다.",
        status: 200,
      };
    }

    return {
      success: response.data.success === 1,
      message: response.data.message || "QR 코드 점검이 완료되었습니다.",
      status: response.data.status || 200,
    };
  } catch (error) {
    console.error("QR 검사 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || "QR 검사에 실패했습니다.");
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
export async function deleteQR(id) {
  try {
    if (!id) {
      throw new Error("QR 코드 ID가 필요합니다.");
    }

    console.log("QR 삭제 시작:", id);
    await api.delete(`/qr/delete/${id}`, {
      data: { id },
    });
    console.log("QR 삭제 성공");

    // 삭제 요청이 성공하면 무조건 성공 응답 반환
    return {
      success: 1,
      message: "QR 코드가 삭제되었습니다.",
      status: 200,
    };
  } catch (error) {
    console.error("QR 삭제 오류:", error);
    throw new Error("QR 삭제에 실패했습니다.");
  }
}
