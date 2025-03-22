import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Dashboard.module.css";
import DeleteModal from "../app/components/DeleteModal";
import LoadingSpinner from "../app/components/LoadingSpinner";
import { useApp } from "@/app/context/AppContext";
import ResultModal from "../app/components/ResultModal";

export default function Home() {
  const router = useRouter();
  const { qrCodes, setQrCodes, loading, setLoading, error, setError } =
    useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("QR 코드 목록 로딩 시작...");

        const response = await fetch("/api/qr/list");
        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        console.log("QR 코드 목록 로딩 완료:", data.length, "개");

        setQrCodes(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("QR 코드 목록 로딩 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCodes();
  }, []);

  const handleInspect = (qrId) => {
    router.push(`/inspect?qrId=${qrId}`);
  };

  const toggleRowExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // QR 코드 정렬 함수
  const sortQRCodes = (qrCodes) => {
    return [...qrCodes].sort((a, b) => {
      // 미점검 상태를 최상위로
      if (!a.last_scanned_at && b.last_scanned_at) return -1;
      if (a.last_scanned_at && !b.last_scanned_at) return 1;

      // 둘 다 점검된 경우, 최근 점검일 기준으로 정렬
      if (a.last_scanned_at && b.last_scanned_at) {
        return new Date(b.last_scanned_at) - new Date(a.last_scanned_at);
      }

      return 0;
    });
  };

  // 필터링 및 정렬된 QR 코드 목록
  const filteredQRCodes = sortQRCodes(
    qrCodes
      .filter((qr) => {
        // 검색어 필터링
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            (qr.description?.toLowerCase() || "").includes(searchLower) ||
            (qr.address?.toLowerCase() || "").includes(searchLower) ||
            (qr.original_url?.toLowerCase() || "").includes(searchLower)
          );
        }
        return true;
      })
      .filter((qr) => {
        // 상태 필터링
        switch (filter) {
          case "compromised":
            return qr.is_compromised === 1;
          case "safe":
            return qr.last_scanned_at && qr.is_compromised !== 1;
          case "unchecked":
            return !qr.last_scanned_at;
          default:
            return true;
        }
      })
  );

  // 경과일 계산 함수
  const calculateDaysElapsed = (lastScannedAt) => {
    if (!lastScannedAt) return null;
    const lastDate = new Date(lastScannedAt);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 날짜 포맷 함수
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (qrCode) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/qr/delete?id=${qrCode.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      // 삭제 성공 시 결과 모달 표시
      setIsSuccess(true);
      setMessage("QR 코드가 성공적으로 삭제되었습니다.");
      setShowResultModal(true);
      setShowModal(false);

      // QR 코드 목록에서 삭제된 항목 제거
      setQrCodes((prev) => prev.filter((item) => item.id !== qrCode.id));
    } catch (error) {
      setIsSuccess(false);
      setMessage("삭제 실패: " + error.message);
      setShowResultModal(true);
      setShowModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    if (isSuccess) {
      router.reload(); // 성공 시 대시보드 새로고침
    }
  };

  if (loading || isDeleting) {
    return (
      <LoadingSpinner
        message={
          isDeleting
            ? "QR 코드를 삭제하는 중입니다..."
            : "QR 코드 목록을 불러오는 중입니다..."
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={styles.title}>Qshing Project</h1>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">전체</option>
            <option value="compromised">변조됨</option>
            <option value="safe">안전</option>
            <option value="unchecked">미점검</option>
          </select>
          <Link href="/register" className={styles.registerButton}>
            QR 코드 등록
          </Link>
        </div>

        {error && (
          <div className={styles.errorContainer}>
            <h3 className={styles.errorTitle}>오류 발생</h3>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        {!loading && !error && filteredQRCodes.length === 0 && (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyMessage}>등록된 QR 코드가 없습니다.</p>
          </div>
        )}

        {!loading && !error && filteredQRCodes.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableRow}>
                  <th>상태</th>
                  <th>설명</th>
                  <th>위치</th>
                  <th>URL</th>
                  <th>스캔된 URL</th>
                  <th>마지막 점검</th>
                  <th>경과</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredQRCodes.map((qr) => {
                  const daysElapsed = calculateDaysElapsed(qr.last_scanned_at);
                  const isExpanded = expandedId === qr.id;
                  const rowClass = `${styles.tableRow} ${
                    isExpanded ? styles.expandedRow : ""
                  } ${qr.last_scanned_at ? styles.checkedRow : ""}`;

                  return (
                    <tr
                      key={qr.id}
                      className={rowClass}
                      onClick={() => toggleRowExpand(qr.id)}
                    >
                      <td>
                        <span
                          className={`${styles.badge} ${
                            qr.is_compromised === 1
                              ? styles.compromised
                              : qr.last_scanned_at
                              ? styles.safe
                              : styles.unchecked
                          }`}
                        >
                          {qr.is_compromised === 1
                            ? "변조"
                            : qr.last_scanned_at
                            ? "안전"
                            : "미점검"}
                        </span>
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          styles.descriptionCell
                        } ${isExpanded ? styles.expanded : styles.truncated}`}
                      >
                        {qr.description}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          styles.addressCell
                        } ${isExpanded ? styles.expanded : styles.truncated}`}
                      >
                        {qr.address}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${styles.urlCell} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {qr.original_url}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${styles.urlCell} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {qr.last_scanned_url || "-"}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {formatDate(qr.last_scanned_at)}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {daysElapsed ? `${daysElapsed}일` : "-"}
                      </td>
                      <td className={styles.cellCommon}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.inspectButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspect(qr.id);
                            }}
                          >
                            점검
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQrCode(qr);
                              setShowModal(true);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <DeleteModal
          qrCode={selectedQrCode}
          onClose={() => {
            setShowModal(false);
            setSelectedQrCode(null);
          }}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {showResultModal && (
        <ResultModal
          isCompromised={!isSuccess}
          onClose={handleResultModalClose}
          type={isSuccess ? "delete" : "error"}
          message={message}
        />
      )}
    </div>
  );
}
