import styles from "../../styles/Dashboard.module.css";

const ResultModal = ({ isCompromised, onClose, type = "inspect", message }) => {
  const getMessage = () => {
    if (message) return message;

    switch (type) {
      case "delete":
        return "QR 코드가 성공적으로 삭제되었습니다.";
      case "register":
        return "QR 코드가 성공적으로 등록되었습니다.";
      case "error":
        return "오류가 발생했습니다.";
      default:
        return isCompromised
          ? "QR 코드가 위변조되었습니다!"
          : "QR 코드가 정상입니다.";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "delete":
        return "삭제 완료";
      case "register":
        return "등록 완료";
      case "error":
        return "오류";
      default:
        return "점검 결과";
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{getTitle()}</h2>
        <div className={styles.modalDetails}>
          <p className={styles.resultMessage}>{getMessage()}</p>
        </div>
        <div className={styles.modalButtons}>
          <button className={styles.modalConfirmButton} onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
