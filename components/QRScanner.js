import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../styles/QRScanner.module.css";
import QrScanner from "qr-scanner";

const QRScanner = forwardRef(
  ({ onScan, initialMessage = "스캔 시작하기" }, ref) => {
    const videoRef = useRef(null);
    const scannerRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [buttonText, setButtonText] = useState(initialMessage);

    useEffect(() => {
      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current.destroy();
          scannerRef.current = null;
        }
      };
    }, []);

    const initScanner = () => {
      if (!videoRef.current || scannerRef.current) return;

      try {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            if (onScan && result?.data) {
              onScan(result.data);
              stopScanner();
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        if (scanning) {
          scannerRef.current.start();
        }
      } catch (error) {
        console.error("QR 스캐너 초기화 오류:", error);
      }
    };

    useEffect(() => {
      // DOM이 마운트된 후 타이머로 스캐너 초기화
      const timer = setTimeout(() => {
        initScanner();
      }, 100);

      return () => clearTimeout(timer);
    }, [scanning]);

    const toggleScanner = () => {
      if (scanning) {
        stopScanner();
      } else {
        startScanner();
      }
    };

    const startScanner = () => {
      setScanning(true);
      setButtonText("스캔 중지하기");

      if (scannerRef.current) {
        scannerRef.current.start();
      }
    };

    const stopScanner = () => {
      setScanning(false);
      setButtonText(initialMessage);

      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };

    // 외부에서 스캐너 제어를 위한 메서드 노출
    useImperativeHandle(
      ref,
      () => ({
        start: startScanner,
        stop: stopScanner,
        isScanning: () => scanning,
      }),
      [scanning]
    );

    return (
      <div className={styles.scannerContainer}>
        <video ref={videoRef} className={styles.reader} />
        <button
          className={styles.scanButton}
          onClick={toggleScanner}
          data-scanning={scanning}
        >
          {buttonText}
        </button>
      </div>
    );
  }
);

export default QRScanner;
