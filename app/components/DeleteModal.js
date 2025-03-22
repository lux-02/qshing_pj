import styles from "../../styles/Dashboard.module.css";

export default function DeleteModal({ qrCode, onClose, onDelete, isDeleting }) {
  if (!qrCode) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>정말 삭제하시겠습니까?</h2>

        <div className={styles.modalButtons}>
          <button
            className={styles.modalCancelButton}
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </button>
          <button
            className={styles.modalDeleteButton}
            onClick={() => {
              onDelete(qrCode);
              onClose();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
