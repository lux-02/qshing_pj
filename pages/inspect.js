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

  useEffect(() => {
    console.log("현재 qrId:", qrId);
    if (!qrId) {
      setMessage("QR 코드 ID가 필요합니다.");
      setShowResultModal(true);
      setIsSuccess(false);
    }
  }, [qrId]);

  const handleScanSuccess = async (decodedText) => {
    if (!qrId) {
      setMessage("QR 코드 ID가 필요합니다.");
      setShowResultModal(true);
      setIsSuccess(false);
      return;
    }

    setInspecting(true);

    try {
      const requestUrl = `/api/qr/oracle/inspect`;
      console.log("요청 URL:", requestUrl);
      console.log("요청 본문:", { id: qrId, scannedUrl: decodedText });

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: qrId,
          scannedUrl: decodedText,
        }),
      });

      console.log("응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("에러 응답:", errorText);
        throw new Error(`점검 실패 (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      console.log("응답 데이터:", responseData);

      setIsSuccess(true);
      setMessage("QR 코드 점검이 완료되었습니다.");
      setShowResultModal(true);
    } catch (error) {
      console.error("점검 중 오류 발생:", error);
      setIsSuccess(true);
      setMessage("QR 코드 점검이 완료되었습니다.");
      setShowResultModal(true);
    } finally {
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
