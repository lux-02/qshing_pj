import axios from "axios";

// Oracle REST API 설정
const ORACLE_REST_API_URL = process.env.ORACLE_REST_API_URL;
const ORACLE_REST_USER = process.env.ORACLE_USER;
const ORACLE_REST_PASSWORD = process.env.ORACLE_PASSWORD;

// 기본 axios 인스턴스 생성
const api = axios.create({
  baseURL: ORACLE_REST_API_URL,
  auth: {
    username: ORACLE_REST_USER,
    password: ORACLE_REST_PASSWORD,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

// QR 코드 목록 조회
export async function getQRList() {
  try {
    const response = await api.get("/qr/list");
    return response.data;
  } catch (error) {
    console.error("QR 목록 조회 오류:", error);
    throw new Error("QR 목록을 가져오는데 실패했습니다.");
  }
}

// QR 코드 상세 정보 조회
export async function getQRDetail(qrId) {
  try {
    const response = await api.get(`/qr/detail/${qrId}`);
    return response.data;
  } catch (error) {
    console.error("QR 상세 정보 조회 오류:", error);
    throw new Error("QR 상세 정보를 가져오는데 실패했습니다.");
  }
}

// QR 코드 검사
export async function inspectQR(qrId, scannedUrl) {
  try {
    const response = await api.post("/qr/inspect", {
      qrId,
      scannedUrl,
    });
    return response.data;
  } catch (error) {
    console.error("QR 검사 오류:", error);
    throw new Error("QR 검사에 실패했습니다.");
  }
}

// QR 코드 등록
export async function registerQR(originalUrl) {
  try {
    const response = await api.post("/qr/register", {
      originalUrl,
    });
    return response.data;
  } catch (error) {
    console.error("QR 등록 오류:", error);
    throw new Error("QR 등록에 실패했습니다.");
  }
}

// QR 코드 삭제
export async function deleteQR(qrId) {
  try {
    const response = await api.delete(`/qr/delete/${qrId}`);
    return response.data;
  } catch (error) {
    console.error("QR 삭제 오류:", error);
    throw new Error("QR 삭제에 실패했습니다.");
  }
}
