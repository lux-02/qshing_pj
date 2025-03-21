import styles from "../../styles/Dashboard.module.css";

export default function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>QR 코드 목록을 불러오는 중...</p>
      <p className={styles.loadingSubText}>잠시만 기다려주세요</p>
    </div>
  );
}
