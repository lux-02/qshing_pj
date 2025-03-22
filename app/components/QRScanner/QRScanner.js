"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { inspectQRCode } from "./inspect";

export default function QRScanner({ onScanSuccess, onScanError }) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          try {
            console.log("QR 코드 스캔 성공:", decodedText);
            if (onScanSuccess) {
              await onScanSuccess(decodedText);
            }
          } catch (error) {
            console.error("스캔 성공 처리 중 오류:", error);
            if (onScanError) {
              onScanError(error);
            }
          } finally {
            // 스캐너 정리
            if (scannerRef.current) {
              try {
                await scannerRef.current.clear();
              } catch (error) {
                console.error("스캐너 정리 중 오류:", error);
              }
            }
          }
        },
        (errorMessage) => {
          console.log("QR 코드 스캔 실패:", errorMessage);
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      );

      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("스캐너 정리 중 오류:", error);
        });
      }
    };
  }, [isScanning, onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="reader" className="w-full"></div>
    </div>
  );
}
