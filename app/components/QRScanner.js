import { useEffect, useRef, forwardRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import styles from "../../styles/QRScanner.module.css";

const QRScanner = forwardRef(({ onScanSuccess }, ref) => {
  const scannerRef = useRef(null);
  const readerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

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
            rememberLastUsedCamera: true,
          },
          false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScanSuccess(decodedText);
            // 스캔 성공 시 자동으로 스캐너 중지
            if (scannerRef.current) {
              scannerRef.current.clear();
              setScanning(false);
            }
          },
          (errorMessage) => {
            // 에러는 무시
          }
        );

        setScanning(true);
      }
    };

    // DOM이 마운트된 후에 스캐너 초기화
    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear();
        setScanning(false);
      }
    };
  }, [onScanSuccess]);

  // ref를 통해 외부에서 스캐너 제어 가능하도록 함
  if (ref) {
    ref.current = {
      stop: () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
          setScanning(false);
        }
      },
      start: () => {
        if (scannerRef.current && !scanning) {
          scannerRef.current.render(
            (decodedText) => {
              onScanSuccess(decodedText);
              // 스캔 성공 시 자동으로 스캐너 중지
              if (scannerRef.current) {
                scannerRef.current.clear();
                setScanning(false);
              }
            },
            (errorMessage) => {
              // 에러는 무시
            }
          );
          setScanning(true);
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
        data-scanning={scanning}
        onClick={() => {
          if (scannerRef.current) {
            if (scanning) {
              scannerRef.current.clear();
              setScanning(false);
            } else {
              scannerRef.current.render(
                (decodedText) => {
                  onScanSuccess(decodedText);
                  // 스캔 성공 시 자동으로 스캐너 중지
                  if (scannerRef.current) {
                    scannerRef.current.clear();
                    setScanning(false);
                  }
                },
                (errorMessage) => {
                  // 에러는 무시
                }
              );
              setScanning(true);
            }
          }
        }}
      >
        {scanning ? "스캔 중지" : "QR 코드 스캔"}
      </button>
    </div>
  );
});

QRScanner.displayName = "QRScanner";

export default QRScanner;
