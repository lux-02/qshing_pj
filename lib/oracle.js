import oracledb from "oracledb";

let pool = null;

// Oracle 클라이언트 초기화
try {
  oracledb.initOracleClient();
  console.log("Oracle 클라이언트 초기화 성공");
} catch (error) {
  if (error.code === "NJS-090") {
    console.log("Oracle 클라이언트가 이미 초기화되어 있습니다.");
  } else {
    console.error("Oracle 클라이언트 초기화 실패:", error);
  }
}

// 데이터베이스 연결 설정
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  walletLocation: process.env.ORACLE_WALLET_LOCATION,
  walletPassword: process.env.ORACLE_WALLET_PASSWORD,
  // Autonomous Database 설정
  configDir: process.env.ORACLE_WALLET_LOCATION,
  libDir: process.env.ORACLE_WALLET_LOCATION,
  // mTLS 설정
  ssl: true,
  sslServerDNMatch: true,
  // 연결 타임아웃 설정
  connectTimeout: 60000,
  // 재시도 설정
  retryCount: 3,
  retryDelay: 1000,
};

// 연결 풀 설정
const poolConfig = {
  ...dbConfig,
  poolMin: 2,
  poolMax: 5,
  poolIncrement: 1,
  // 풀 타임아웃 설정
  poolTimeout: 60000,
  // 풀 재시도 설정
  poolPingInterval: 60000,
};

// 데이터베이스 연결 함수
export async function getConnection() {
  try {
    if (!pool) {
      console.log("Oracle 연결 풀 초기화 시도...");
      console.log("설정:", {
        user: dbConfig.user,
        connectString: dbConfig.connectString,
        walletLocation: dbConfig.walletLocation,
      });

      // 연결 풀 생성 전에 wallet 설정 확인
      if (!dbConfig.walletLocation) {
        throw new Error("Oracle Wallet 위치가 설정되지 않았습니다.");
      }

      // Wallet 파일 존재 여부 확인
      const fs = require("fs");
      const walletPath = dbConfig.walletLocation;
      if (!fs.existsSync(walletPath)) {
        throw new Error(`Wallet 파일을 찾을 수 없습니다: ${walletPath}`);
      }

      // 필수 Wallet 파일 확인
      const requiredFiles = ["cwallet.sso", "sqlnet.ora", "tnsnames.ora"];
      for (const file of requiredFiles) {
        if (!fs.existsSync(`${walletPath}/${file}`)) {
          throw new Error(`필수 Wallet 파일이 없습니다: ${file}`);
        }
      }

      pool = await oracledb.createPool(poolConfig);
      console.log("Oracle 연결 풀 초기화 성공");
    }

    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
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
    throw new Error(`데이터베이스 연결에 실패했습니다: ${error.message}`);
  }
}

// 연결 풀 종료 함수
export async function closePool() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("Oracle 연결 풀 종료 완료");
    }
  } catch (error) {
    console.error("Pool closing error:", error);
  }
}
