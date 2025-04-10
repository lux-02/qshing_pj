import { useState } from "react";
import styles from "../styles/CheckTest.module.css";

export default function CheckTest() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!url) {
      setError("URL을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/check-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "URL 검사에 실패했습니다.");
      }

      setResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>URL 보안 검사 테스트</h1>

        <div className={styles.inputContainer}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검사할 URL을 입력하세요 (예: www.example.com)"
            className={styles.input}
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className={styles.checkButton}
          >
            {loading ? "검사 중..." : "검사하기"}
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className={styles.resultContainer}>
            <h2 className={styles.resultTitle}>검사 결과</h2>
            <div className={styles.resultDetails}>
              <p className={styles.status}>
                상태: {result.query_status === "ok" ? "검사 완료" : "검사 실패"}
              </p>
              {result.query_status === "ok" && (
                <>
                  <p
                    className={
                      result.threat === "none" ? styles.safe : styles.malicious
                    }
                  >
                    위협 여부: {result.threat === "none" ? "안전" : "악성"}
                  </p>
                  {result.threat !== "none" && (
                    <p className={styles.threatType}>
                      위협 유형: {result.threat}
                    </p>
                  )}
                  {result.message && (
                    <p className={styles.message}>{result.message}</p>
                  )}
                  {result.urlhaus_reference && (
                    <p className={styles.reference}>
                      URLHaus 참조:{" "}
                      <a
                        href={result.urlhaus_reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        자세히 보기
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
