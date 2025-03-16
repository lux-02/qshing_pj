import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import QRScanner from "../app/components/QRScanner";
import styles from "../styles/Inspect.module.css";

export default function Inspect() {
  const router = useRouter();
  const [inspecting, setInspecting] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // 페이지가 마운트된 후 약간의 지연을 주어 렌더링이 완료된 후 스캔 시작
    const timer = setTimeout(() => {
      setPageLoaded(true);
      const scannerElement = document.querySelector(
        '[data-testid="qr-scanner-button"]'
      );
      if (scannerElement) {
        scannerElement.click();
      }
    }, 500); // 500ms 지연

    return () => clearTimeout(timer);
  }, []);

  const handleScanSuccess = async (decodedText) => {
    setInspecting(true);

    try {
      const response = await fetch("/api/qr/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrId: router.query.qrId,
          scannedUrl: decodedText,
        }),
      });

      if (!response.ok) {
        throw new Error("점검 실패");
      }

      const result = await response.json();

      if (result.success) {
        alert("점검이 완료되었습니다.");
        router.replace("/");
      } else {
        throw new Error(result.message || "점검 실패");
      }
    } catch (error) {
      alert("점검 실패: " + error.message);
      setInspecting(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.scannerContainer}>
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>

        {inspecting && (
          <div className={styles.loadingMessage}>
            <p>점검 중입니다...</p>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <Link href="/" className={styles.homeButton}>
            메인 페이지
          </Link>
        </div>
      </main>
    </div>
  );
}
