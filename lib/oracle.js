import oracledb from "oracledb";
import path from "path";

// Thin 모드 활성화 (Thick 모드 비활성화)
oracledb.autoCommit = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = ["CLOB"];
oracledb.initOracleClient({ libDir: undefined });

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
