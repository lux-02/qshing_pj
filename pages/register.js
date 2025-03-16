import { useState } from "react";
import QRScanner from "../app/components/QRScanner";
import styles from "../styles/Register.module.css";

export default function Register() {
  const [formData, setFormData] = useState({
    originalUrl: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const handleScanSuccess = (decodedText) => {
    setFormData((prev) => ({
      ...prev,
      originalUrl: decodedText,
    }));
    alert(`QR 코드 스캔 성공: ${decodedText}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/qr/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location: {
            type: "Point",
            coordinates: [
              parseFloat(formData.longitude),
              parseFloat(formData.latitude),
            ],
            address: formData.address,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("등록 실패");
      }

      alert("QR 코드 등록 성공");

      setFormData({
        originalUrl: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
      });
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
        <h1 className={styles.title}>QR 코드 등록</h1>

        <div className={styles.scannerContainer}>
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>URL</label>
            <input
              className={styles.input}
              name="originalUrl"
              value={formData.originalUrl}
              onChange={handleChange}
              placeholder="QR 코드 URL"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>설명</label>
            <textarea
              className={styles.textarea}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="QR 코드 설명"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>주소</label>
            <input
              className={styles.input}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="QR 코드 설치 주소"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>위도</label>
            <input
              className={styles.input}
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="위도"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>경도</label>
            <input
              className={styles.input}
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="경도"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            등록
          </button>
        </form>
      </main>
    </div>
  );
}
