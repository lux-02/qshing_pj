import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import QRScanner from "@/app/components/QRScanner";
import ResultModal from "@/app/components/ResultModal";
import styles from "@/styles/Scan.module.css";
import { inspectQR } from "@/app/lib/oracle";

export default function ScanQR() {
  const router = useRouter();
  const { id } = router.query;
  const [showScanner, setShowScanner] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScanSuccess = async (decodedText) => {
    try {
      setShowScanner(false);
      const response = await inspectQR(id, decodedText);
      setResult(response);
      setShowResult(true);

      // 3초 후 메인 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("점검 실패:", error);
      setError(error.message);
      setShowResult(true);

      // 3초 후 메인 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    router.push("/");
  };

  if (!id) {
    return <div>잘못된 접근입니다.</div>;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>QR 코드 점검</h1>

        {showScanner ? (
          <div className={styles.scannerContainer}>
            <QRScanner onScanSuccess={handleScanSuccess} />
            <button
              onClick={() => router.push("/")}
              className={styles.cancelButton}
            >
              취소
            </button>
          </div>
        ) : null}

        {showResult && (
          <ResultModal
            isOpen={showResult}
            onClose={handleCloseResult}
            title="점검 완료"
            message={error || "QR 코드 점검이 완료되었습니다."}
            type="success"
          />
        )}
      </main>
    </div>
  );
}
