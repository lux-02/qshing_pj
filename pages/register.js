import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import QRScanner from "@/app/components/QRScanner";
import LoadingSpinner from "../app/components/LoadingSpinner";
import ResultModal from "../app/components/ResultModal";
import styles from "../styles/Register.module.css";

export default function Register() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // QR 스캐너 자동 시작을 위한 useEffect
  useEffect(() => {
    if (showScanner && pageLoaded) {
      const timer = setTimeout(() => {
        const scannerElement = document.querySelector(
          '[data-testid="qr-scanner-button"]'
        );
        if (scannerElement) {
          scannerElement.click();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showScanner, pageLoaded]);

  // 페이지 로드 상태 관리
  useEffect(() => {
    setPageLoaded(true);
    return () => setPageLoaded(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/qr/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl: url,
          description: description || "",
          address: address || "",
        }),
      });

      if (!response.ok) {
        throw new Error("QR 코드 등록에 실패했습니다.");
      }

      const data = await response.json();
      setMessage("QR 코드가 성공적으로 등록되었습니다.");
      setShowMessage(true);
      setUrl("");
      setDescription("");
      setAddress("");

      // 등록 성공 시 메인 페이지로 리다이렉트
      router.push("/");
    } catch (error) {
      setMessage(error.message);
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setUrl(decodedText);
    setShowScanner(false);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    if (isSuccess && !showScanner) {
      router.push("/");
    }
  };

  if (loading) {
    return <LoadingSpinner message="QR 코드를 등록하는 중입니다..." />;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Registration</h1>

        {showScanner ? (
          <div className={styles.scannerContainer}>
            <QRScanner onScanSuccess={handleScanSuccess} />
            <button
              onClick={() => setShowScanner(false)}
              className={styles.cancelButton}
            >
              스캔 취소
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="originalUrl" className={styles.label}>
                URL
              </label>
              <div className={styles.urlInputGroup}>
                <input
                  type="url"
                  id="originalUrl"
                  name="originalUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className={styles.input}
                  placeholder="https://example.com"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className={styles.scanButton}
                >
                  QR 스캔
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className={styles.textarea}
                placeholder="QR 코드에 대한 설명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>
                설치 위치
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className={styles.input}
                placeholder="QR 코드가 설치된 위치"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        )}

        {showMessage && (
          <div className={styles.messageContainer}>
            <p className={styles.message}>{message}</p>
          </div>
        )}

        {showResultModal && (
          <ResultModal
            isCompromised={!isSuccess}
            onClose={handleResultModalClose}
            type={isSuccess ? "register" : "error"}
          />
        )}
      </main>
    </div>
  );
}
