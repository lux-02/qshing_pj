import { useEffect, useRef, forwardRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import styles from "../../styles/QRScanner.module.css";

const QRScanner = forwardRef(({ onScanSuccess }, ref) => {
  const scannerRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    // DOM이 마운트된 후에 스캐너 초기화
    const initScanner = () => {
      if (!readerRef.current) {
        readerRef.current = document.getElementById("reader");
      }

      if (!readerRef.current) {
        console.error("QR 스캐너 요소를 찾을 수 없습니다.");
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScanSuccess(decodedText);
            // 스캔 성공 시 자동으로 스캐너 중지
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
          },
          (errorMessage) => {
            // 에러는 무시
          }
        );
      }
    };

    // DOM이 마운트된 후에 스캐너 초기화
    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onScanSuccess]);

  // ref를 통해 외부에서 스캐너 제어 가능하도록 함
  if (ref) {
    ref.current = {
      stop: () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
    };
  }

  return (
    <div className={styles.scannerContainer}>
      <div id="reader" className={styles.reader} />
      <button
        data-testid="qr-scanner-button"
        className={styles.scanButton}
        onClick={() => {
          if (scannerRef.current) {
            scannerRef.current.render(
              (decodedText) => {
                onScanSuccess(decodedText);
                // 스캔 성공 시 자동으로 스캐너 중지
                if (scannerRef.current) {
                  scannerRef.current.clear();
                }
              },
              (errorMessage) => {
                // 에러는 무시
              }
            );
          }
        }}
      >
        QR 코드 스캔
      </button>
    </div>
  );
});

QRScanner.displayName = "QRScanner";

export default QRScanner;
