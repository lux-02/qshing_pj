import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>QR 코드 모니터링 시스템</h1>
        <p className={styles.description}>
          QR 코드의 변조를 실시간으로 모니터링하고 관리하는 시스템입니다.
        </p>

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => router.push("/register")}
          >
            QR 코드 등록
          </button>

          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => router.push("/dashboard")}
          >
            모니터링 대시보드
          </button>
        </div>
      </main>
    </div>
  );
}
