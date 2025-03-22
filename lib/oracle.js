import oracledb from "oracledb";

// Oracle Wallet 위치 설정
const WALLET_LOCATION = "/tmp/Wallet_QSHING"; // Vercel 환경용
const LOCAL_WALLET_LOCATION = "/Users/lux/Documents/qshing_pj/Wallet_QSHING"; // 로컬 환경용

// 환경에 따른 Wallet 위치 설정
const WALLET_PATH =
  process.env.NODE_ENV === "production"
    ? WALLET_LOCATION
    : LOCAL_WALLET_LOCATION;

// Oracle 클라이언트 초기화
oracledb.initOracleClient({
  libDir: WALLET_PATH,
  configDir: WALLET_PATH,
});

// Oracle 연결 설정
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  walletLocation: WALLET_PATH,
  walletPassword: process.env.ORACLE_WALLET_PASSWORD,
};

// 연결 풀 생성
const pool = oracledb.createPool({
  ...dbConfig,
  poolMin: 2,
  poolMax: 5,
  poolIncrement: 1,
});

// 연결 가져오기
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Oracle 연결 오류:", error);
    throw error;
  }
}

// 연결 풀 종료
export async function closePool() {
  try {
    await pool.close(0);
  } catch (error) {
    console.error("Oracle 연결 풀 종료 오류:", error);
  }
}
