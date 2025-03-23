import { useState } from "react";
import { useRouter } from "next/router";
import QRScanner from "@/app/components/QRScanner";
import styles from "@/styles/Register.module.css";

export default function Register() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanSuccess = (decodedText) => {
    setUrl(decodedText);
    setShowScanner(false);
  };

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

      // 등록 성공 시 메인 페이지로 리다이렉트
      router.push("/");
    } catch (error) {
      setMessage(error.message);
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>QR 코드 등록</h1>

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
              <input
                type="text"
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.input}
                placeholder="설명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>
                주소
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
                placeholder="주소를 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </form>
        )}

        {showMessage && (
          <div className={styles.messageContainer}>
            <p className={styles.message}>{message}</p>
          </div>
        )}
      </main>
    </div>
  );
}
