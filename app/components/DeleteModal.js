import styles from "../../styles/Dashboard.module.css";

export default function DeleteModal({ qrCode, onClose, onDelete, isDeleting }) {
  if (!qrCode) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>QR 코드 삭제</h2>
        <p className={styles.modalMessage}>다음 QR 코드를 삭제하시겠습니까?</p>
        <div className={styles.modalDetails}>
          <p>
            <strong>설명:</strong> {qrCode.DESCRIPTION}
          </p>
          <p>
            <strong>위치:</strong> {qrCode.ADDRESS}
          </p>
          <p>
            <strong>URL:</strong> {qrCode.ORIGINAL_URL}
          </p>
        </div>
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
