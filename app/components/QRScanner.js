import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import styles from "./QRScanner.module.css";

const QRScanner = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await stopScanning();
          onScanSuccess(decodedText);
        },
        (error) => {
          console.log(error);
        }
      );

      setIsScanning(true);
    } catch (error) {
      alert("스캐너 시작 실패: " + error.message);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  return (
    <div className={styles.container}>
      <div id="reader" className={styles.reader} />
      <button
        className={`${styles.button} ${
          isScanning ? styles.buttonStop : styles.buttonStart
        }`}
        onClick={isScanning ? stopScanning : startScanning}
      >
        {isScanning ? "SCAN STOP" : "QR SCAN"}
      </button>
    </div>
  );
};

export default QRScanner;
