import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import QRScanner from "../app/components/QRScanner";
import styles from "../styles/Register.module.css";

export default function Register() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    originalUrl: "",
    description: "",
    address: "",
  });

  const handleScanSuccess = (decodedText) => {
    setFormData((prev) => ({
      ...prev,
      originalUrl: decodedText,
    }));
    setShowScanner(false);
    alert("QR 코드 스캔 완료");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 폼 데이터 검증
    if (!formData.originalUrl || !formData.description || !formData.address) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      console.log("Sending data:", formData); // 디버깅용 로그

      const response = await fetch("/api/qr/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl: formData.originalUrl.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "등록 실패");
      }

      alert("QR 코드가 성공적으로 등록되었습니다.");
      router.push("/");
    } catch (error) {
      alert("등록 실패: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
                  value={formData.originalUrl}
                  onChange={handleChange}
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
                value={formData.description}
                onChange={handleChange}
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
                value={formData.address}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="QR 코드가 설치된 위치"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitButton}>
                등록
              </button>

              <Link href="/" className={styles.homeButton}>
                메인 페이지
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
