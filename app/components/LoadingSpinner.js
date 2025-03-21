import styles from "../../styles/Dashboard.module.css";

export default function LoadingSpinner({
  message = "QR 코드 데이터를 불러오는 중입니다...",
}) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
}
