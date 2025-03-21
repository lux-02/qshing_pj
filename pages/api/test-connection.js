import { getConnection } from "@/app/lib/oracle";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let connection;
  try {
    console.log("=== Oracle Cloud 연결 테스트 시작 ===");
    console.log("환경 변수 확인:");
    console.log(
      "- ORACLE_USER:",
      process.env.ORACLE_USER ? "설정됨" : "미설정"
    );
    console.log(
      "- ORACLE_PASSWORD:",
      process.env.ORACLE_PASSWORD ? "설정됨" : "미설정"
    );
    console.log(
      "- ORACLE_CONNECTION_STRING:",
      process.env.ORACLE_CONNECTION_STRING ? "설정됨" : "미설정"
    );

    console.log("\n1. 연결 시도...");
    connection = await getConnection();
    console.log("2. 연결 성공!");

    console.log("\n3. 테스트 쿼리 실행...");
    const result = await connection.execute("SELECT SYSDATE FROM DUAL");
    console.log("4. 쿼리 실행 성공!");
    console.log("현재 DB 시간:", result.rows[0].SYSDATE);

    res.status(200).json({
      success: true,
      message: "Oracle Cloud 연결 성공",
      timestamp: result.rows[0].SYSDATE,
    });
  } catch (error) {
    console.error("\n=== Oracle Cloud 연결 테스트 실패 ===");
    console.error("오류 유형:", error.name);
    console.error("오류 메시지:", error.message);
    console.error("오류 코드:", error.errorNum);
    console.error("스택 트레이스:", error.stack);

    res.status(500).json({
      success: false,
      message: "Oracle Cloud 연결 실패",
      error: {
        name: error.name,
        message: error.message,
        code: error.errorNum,
      },
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("\n5. 연결 종료");
      } catch (err) {
        console.error("연결 종료 실패:", err);
      }
    }
    console.log("\n=== Oracle Cloud 연결 테스트 완료 ===");
  }
}
