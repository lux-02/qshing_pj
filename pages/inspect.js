import { useState, useEffect } from "react";
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleScanSuccess = async (decodedText) => {
    if (!qrId) {
      return;
    }

    setInspecting(true);

    try {
      const response = await fetch(`/api/qr/oracle/inspect?id=${qrId}`, {
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
        setIsSuccess(true);
        setMessage("QR 코드 점검이 완료되었습니다.");
        setShowResultModal(true);
      } else {
        throw new Error(result.message || "점검 실패");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("점검 실패: " + error.message);
      setShowResultModal(true);
    } finally {
      setInspecting(false);
    }
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    if (isSuccess) {
      router.replace("/");
    }
  };

  if (inspecting) {
    return <LoadingSpinner message="QR 코드를 점검하는 중입니다..." />;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.scannerContainer}>
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>

        <div className={styles.buttonContainer}>
          <Link href="/" className={styles.homeButton}>
            메인 페이지
          </Link>
        </div>

        {showResultModal && (
          <ResultModal
            isCompromised={!isSuccess}
            onClose={handleResultModalClose}
            type={isSuccess ? "inspect" : "error"}
            message={message}
          />
        )}
      </main>
    </div>
  );
}
