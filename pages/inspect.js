import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import QRScanner from "../app/components/QRScanner";
import LoadingSpinner from "../app/components/LoadingSpinner";
import ResultModal from "../app/components/ResultModal";
import styles from "../styles/Inspect.module.css";

export default function Inspect() {
  const router = useRouter();
  const { qrId } = router.query;
  const [inspecting, setInspecting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isCompromised, setIsCompromised] = useState(false);
  const scannerRef = useRef(null);

  const handleScanSuccess = async (decodedText) => {
    if (!qrId) {
      return;
    }

    setInspecting(true);

    try {
      const response = await fetch(`/api/qr/inspect?id=${qrId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scannedUrl: decodedText,
        }),
      });

      if (!response.ok) {
        throw new Error("점검 실패");
      }

      const result = await response.json();

      if (result.success) {
        // 결과 모달 표시
        setIsCompromised(result.isCompromised);
        setShowResultModal(true);
        setInspecting(false); // 로딩 상태 해제
      } else {
        throw new Error(result.message || "점검 실패");
      }
    } catch (error) {
      alert("점검 실패: " + error.message);
      setInspecting(false);
    }
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    router.replace("/");
  };

  if (inspecting) {
    return <LoadingSpinner message="QR 코드를 점검하는 중입니다..." />;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.scannerContainer}>
          <QRScanner onScanSuccess={handleScanSuccess} ref={scannerRef} />
        </div>

        <div className={styles.buttonContainer}>
          <Link href="/" className={styles.homeButton}>
            메인 페이지
          </Link>
        </div>

        {showResultModal && (
          <ResultModal
            isCompromised={isCompromised}
            onClose={handleResultModalClose}
          />
        )}
      </main>
    </div>
  );
}
