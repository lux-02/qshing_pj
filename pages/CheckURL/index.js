import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/CheckURL.module.css";
import QRScanner from "@/app/components/QRScanner";

export default function CheckURL() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();

  // 페이지 로드 상태 관리
  useEffect(() => {
    setPageLoaded(true);
    return () => setPageLoaded(false);
  }, []);

  // QR 스캐너 자동 시작을 위한 useEffect
  useEffect(() => {
    if (showScanner && pageLoaded) {
      const timer = setTimeout(() => {
        const scannerElement = document.querySelector(
          '[data-testid="qr-scanner-button"]'
        );
        if (scannerElement) {
          scannerElement.click();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showScanner, pageLoaded]);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!url) {
      setError("URL을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 검증 로직 - 간단한 검사만 수행
      const formattedUrl = url.trim();

      // URL 검사를 위한 페이지로 이동
      router.push(`/CheckURL/${encodeURIComponent(formattedUrl)}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCheck(e);
    }
  };

  // QR 스캔 성공 처리
  const handleScanSuccess = (decodedText) => {
    setUrl(decodedText);
    setShowScanner(false);

    // URL을 설정한 후 바로 검사 실행
    router.push(`/CheckURL/${encodeURIComponent(decodedText.trim())}`);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {showScanner ? (
          <div className={styles.scannerContainer}>
            <QRScanner onScanSuccess={handleScanSuccess} />
            <button
              onClick={() => setShowScanner(false)}
              className={styles.cancelButton}
            >
              스캔 취소
            </button>
          </div>
        ) : (
          <>
            <div className={styles.searchContainer}>
              <form onSubmit={handleCheck} className={styles.searchForm}>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="검사할 URL 또는 IP 주소 입력 (예: www.example.com, 8.8.8.8)"
                  className={styles.searchInput}
                />
                <button
                  type="submit"
                  className={styles.searchButton}
                  disabled={loading}
                >
                  {loading ? "검사 중..." : "검사하기"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className={styles.scanButton}
                >
                  QR 스캔
                </button>
              </form>
            </div>

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
