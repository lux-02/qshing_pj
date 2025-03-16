import styles from "./DeleteModal.module.css";

export default function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>삭제 확인</h2>
        <p>정말 삭제하시겠습니까?</p>
        <div className={styles.buttonGroup}>
          <button
            onClick={onConfirm}
            className={`${styles.button} ${styles.deleteButton}`}
          >
            삭제
          </button>
          <button
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
