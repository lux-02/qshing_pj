import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import QRScanner from "../app/components/QRScanner";
import styles from "../styles/Inspect.module.css";
import { getConnection } from "@/lib/oracle";

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
      const connection = await getConnection();
      const result = await connection.execute(
        `SELECT ORIGINAL_URL FROM QR_CODES WHERE ID = :1`,
        [router.query.qrId]
      );

      if (result.rows.length === 0) {
        throw new Error("QR 코드를 찾을 수 없습니다.");
      }

      const originalUrl = result.rows[0][0];
      const scannedUrl = decodedText;

      // TODO: 실제 위변조 검사 로직 구현
      const isCompromised = false;

      // 점검 결과 업데이트
      await connection.execute(
        `UPDATE QR_CODES 
         SET LAST_SCANNED_URL = :1, 
             LAST_SCANNED_AT = SYSDATE, 
             IS_COMPROMISED = :2 
         WHERE ID = :3`,
        [scannedUrl, isCompromised ? 1 : 0, router.query.qrId]
      );

      await connection.commit();

      alert("점검이 완료되었습니다.");
      router.replace("/");
    } catch (error) {
      alert("점검 실패: " + error.message);
      setInspecting(false);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Connection closing error:", error);
        }
      }
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
