import axios from "axios";

let oracledb;

// 서버 사이드에서만 oracledb 모듈 로드
if (typeof window === "undefined") {
  oracledb = require("oracledb");

  // 자동 커밋 설정
  oracledb.autoCommit = true;

  // 객체 형식으로 결과 반환
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

  // Oracle 설정 디렉토리 설정
  process.env.TNS_ADMIN = process.env.ORACLE_WALLET_LOCATION;
  process.env.ORACLE_CLIENT_PATH = "/usr/local/lib";

  try {
    // 초기화 옵션 설정
    oracledb.initOracleClient({
      libDir: "/usr/local/lib",
      configDir: process.env.ORACLE_WALLET_LOCATION,
    });
    console.log("Oracle 클라이언트 초기화 성공");
  } catch (err) {
    if (err.message.includes("NJS-077")) {
      console.log("Oracle 클라이언트가 이미 초기화되어 있습니다.");
    } else {
      console.error("Oracle 클라이언트 초기화 실패:", err);
      throw err;
    }
  }
}

// Oracle Cloud 연결 설정
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  poolMin: 1,
  poolMax: 4,
  poolIncrement: 1,
  poolTimeout: 60,
  queueTimeout: 60000,
  enableStatistics: true,
};

let pool = null;

// Oracle 연결 풀 초기화
export async function initializeOracle() {
  if (typeof window !== "undefined") {
    console.log("Oracle Cloud 연결은 서버 사이드에서만 가능합니다.");
    return;
  }

  try {
    if (pool) {
      console.log("기존 Oracle 연결 풀 사용");
      return pool;
    }

    console.log("Oracle 연결 풀 초기화 시도...");
    console.log("설정:", {
      user: dbConfig.user,
      connectString: dbConfig.connectString,
    });

    pool = await oracledb.createPool(dbConfig);
    console.log("Oracle 연결 풀 초기화 성공");

    return pool;
  } catch (error) {
    console.error("Oracle 연결 풀 초기화 실패:", error);
    throw error;
  }
}

// Oracle 연결 풀 종료
export async function closeOracle() {
  if (typeof window !== "undefined") {
    return;
  }

  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("Oracle 연결 풀 종료");
    }
  } catch (error) {
    console.error("Oracle 연결 풀 종료 실패:", error);
    throw error;
  }
}

// Oracle 연결 가져오기
export async function getConnection() {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    if (!pool) {
      await initializeOracle();
    }

    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Oracle 연결 가져오기 실패:", error);
    throw error;
  }
}

// 테이블 생성
export async function createTables() {
  let connection;
  try {
    connection = await getConnection();

    // QR_CODES 테이블 생성
    await connection.execute(`
      CREATE TABLE QR_CODES (
        ID VARCHAR2(50) PRIMARY KEY,
        DESCRIPTION VARCHAR2(500),
        ADDRESS VARCHAR2(500),
        ORIGINAL_URL VARCHAR2(1000),
        LAST_SCANNED_URL VARCHAR2(1000),
        LAST_SCANNED_AT TIMESTAMP,
        IS_COMPROMISED NUMBER(1) DEFAULT 0,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("QR_CODES 테이블 생성 완료");
  } catch (error) {
    if (error.errorNum === 955) {
      console.log("QR_CODES 테이블이 이미 존재합니다.");
    } else {
      console.error("테이블 생성 실패:", error);
      throw error;
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("연결 종료 실패:", err);
      }
    }
  }
}

// QR 코드 테이블 생성
export async function createQRCodesTable() {
  let connection;
  try {
    connection = await getConnection();

    // 기존 테이블이 있다면 삭제
    try {
      await connection.execute(`DROP TABLE QR_CODES`);
      console.log("기존 QR_CODES 테이블 삭제 완료");
    } catch (err) {
      if (err.errorNum !== 942) {
        // ORA-00942: 테이블 또는 뷰가 존재하지 않습니다
        throw err;
      }
    }

    // 테이블 생성
    await connection.execute(`
      CREATE TABLE QR_CODES (
        ID VARCHAR2(50) PRIMARY KEY,
        DESCRIPTION VARCHAR2(500),
        ADDRESS VARCHAR2(500),
        ORIGINAL_URL VARCHAR2(1000),
        LAST_SCANNED_URL VARCHAR2(1000),
        LAST_SCANNED_AT TIMESTAMP,
        IS_COMPROMISED NUMBER(1) DEFAULT 0,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("QR_CODES 테이블 생성 완료");

    // 시퀀스 생성 (자동 증가 ID를 위해)
    try {
      await connection.execute(`DROP SEQUENCE QR_CODES_SEQ`);
      console.log("기존 QR_CODES_SEQ 시퀀스 삭제 완료");
    } catch (err) {
      if (err.errorNum !== 2289) {
        // ORA-02289: 시퀀스가 존재하지 않습니다
        throw err;
      }
    }

    await connection.execute(`
      CREATE SEQUENCE QR_CODES_SEQ
      START WITH 1
      INCREMENT BY 1
      NOCACHE
      NOCYCLE
    `);
    console.log("QR_CODES_SEQ 시퀀스 생성 완료");

    // 트리거 생성 (UPDATED_AT 자동 업데이트를 위해)
    try {
      await connection.execute(`DROP TRIGGER QR_CODES_UPDATE_TRIGGER`);
      console.log("기존 QR_CODES_UPDATE_TRIGGER 트리거 삭제 완료");
    } catch (err) {
      if (err.errorNum !== 4080) {
        // ORA-04080: 트리거가 존재하지 않습니다
        throw err;
      }
    }

    await connection.execute(`
      CREATE OR REPLACE TRIGGER QR_CODES_UPDATE_TRIGGER
      BEFORE UPDATE ON QR_CODES
      FOR EACH ROW
      BEGIN
        :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
      END;
    `);
    console.log("QR_CODES_UPDATE_TRIGGER 트리거 생성 완료");

    return true;
  } catch (error) {
    console.error("QR_CODES 테이블 생성 실패:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("연결 종료 실패:", err);
      }
    }
  }
}

// QR 코드 생성
export async function createQRCode({ description, address, originalUrl }) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO QR_CODES (
        ID, DESCRIPTION, ADDRESS, ORIGINAL_URL, 
        LAST_SCANNED_URL, LAST_SCANNED_AT, IS_COMPROMISED
      ) VALUES (
        QR_CODES_SEQ.NEXTVAL, :description, :address, :originalUrl,
        NULL, NULL, 0
      ) RETURNING ID INTO :id`,
      {
        description,
        address,
        originalUrl,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const id = result.outBinds.id[0];

    // 생성된 QR 코드 정보 조회
    const { rows } = await connection.execute(
      `SELECT 
        ID, DESCRIPTION, ADDRESS, ORIGINAL_URL, 
        LAST_SCANNED_URL, LAST_SCANNED_AT, IS_COMPROMISED,
        CREATED_AT, UPDATED_AT
      FROM QR_CODES WHERE ID = :id`,
      [id]
    );

    return rows[0];
  } catch (error) {
    console.error("QR 코드 생성 중 오류 발생:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("연결 종료 중 오류 발생:", error);
      }
    }
  }
}

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
    console.log("QR 검사 시작:", { id, scannedUrl });
    const response = await api.post("/qr/inspect", {
      id,
      scannedUrl,
    });
    console.log("QR 검사 성공:", response.data);
    return response.data.items?.[0] || null;
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
export async function registerQR(originalUrl, description = "", address = "") {
  try {
    console.log("QR 등록 시작:", { originalUrl, description, address });
    const response = await api.post("/qr/register", {
      originalUrl,
      description,
      address,
    });
    console.log("QR 등록 성공:", response.data);
    return response.data.items?.[0] || null;
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
    console.log("QR 삭제 시작:", id);
    const response = await api.delete(`/qr/delete/${id}`);
    console.log("QR 삭제 성공:", response.data);
    return response.data.items?.[0] || null;
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
