import oracledb from "oracledb";
import path from "path";
import axios from "axios";

// Thin 모드 활성화
oracledb.autoCommit = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = ["CLOB"];

// Thin 모드로 초기화
if (process.env.NODE_ENV === "production") {
  try {
    // Thin 모드 강제 설정
    oracledb.initOracleClient({ libDir: undefined, configDir: undefined });
    console.log("Oracle Thin 모드 초기화 성공");
  } catch (err) {
    console.log("Oracle Thin 모드 초기화 중 오류:", err);
  }
}

// Oracle Wallet 위치 설정
const WALLET_PATH = path.join(process.cwd(), "Wallet_QSHING");

console.log("현재 작업 디렉토리:", process.cwd());
console.log("Wallet 경로:", WALLET_PATH);

// Oracle 연결 설정
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  walletLocation: WALLET_PATH,
  walletPassword: process.env.ORACLE_WALLET_PASSWORD,
};

// 연결 풀 생성
let pool = null;

// 연결 가져오기
export async function getConnection() {
  try {
    if (!pool) {
      console.log("Oracle 연결 풀 초기화 시도...");
      console.log("설정:", {
        user: dbConfig.user,
        connectString: dbConfig.connectString,
        walletLocation: dbConfig.walletLocation,
      });

      pool = await oracledb.createPool({
        ...dbConfig,
        poolMin: 2,
        poolMax: 5,
        poolIncrement: 1,
      });
      console.log("Oracle 연결 풀 초기화 성공");
    }

    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Oracle 연결 오류:", error);
    if (error.code === "ORA-12506") {
      throw new Error(
        "데이터베이스 접근이 거부되었습니다. Oracle Cloud Console에서 IP 주소가 허용 목록에 추가되어 있는지 확인해주세요."
      );
    }
    if (error.code === "NJS-040") {
      throw new Error(
        "SSL/TLS 연결 실패. Wallet 파일이 올바르게 설정되어 있는지 확인해주세요."
      );
    }
    throw error;
  }
}

// 연결 풀 종료
export async function closePool() {
  try {
    if (pool) {
      await pool.close(0);
      pool = null;
      console.log("Oracle 연결 풀 종료 완료");
    }
  } catch (error) {
    console.error("Oracle 연결 풀 종료 오류:", error);
  }
}

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
