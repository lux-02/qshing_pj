import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Dashboard.module.css";
import DeleteModal from "../app/components/DeleteModal";
import LoadingSpinner from "../app/components/LoadingSpinner";
import { useApp } from "@/app/context/AppContext";

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
      if (!a.LAST_SCANNED_AT && b.LAST_SCANNED_AT) return -1;
      if (a.LAST_SCANNED_AT && !b.LAST_SCANNED_AT) return 1;

      // 둘 다 점검된 경우, 최근 점검일 기준으로 정렬
      if (a.LAST_SCANNED_AT && b.LAST_SCANNED_AT) {
        return new Date(b.LAST_SCANNED_AT) - new Date(a.LAST_SCANNED_AT);
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
            (qr.DESCRIPTION?.toLowerCase() || "").includes(searchLower) ||
            (qr.ADDRESS?.toLowerCase() || "").includes(searchLower) ||
            (qr.ORIGINAL_URL?.toLowerCase() || "").includes(searchLower)
          );
        }
        return true;
      })
      .filter((qr) => {
        // 상태 필터링
        switch (filter) {
          case "compromised":
            return qr.IS_COMPROMISED === 1;
          case "safe":
            return qr.LAST_SCANNED_AT && qr.IS_COMPROMISED !== 1;
          case "unchecked":
            return !qr.LAST_SCANNED_AT;
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

  const handleDelete = async (qr) => {
    try {
      const response = await fetch(`/api/qr/delete?id=${qr.ID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      // 성공적으로 삭제된 경우 목록에서 제거
      setQrCodes((prevCodes) => prevCodes.filter((q) => q.ID !== qr.ID));
      alert("QR 코드가 삭제되었습니다.");
    } catch (error) {
      alert("삭제 실패: " + error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

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

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className={styles.errorContainer}>
            <h3 className={styles.errorTitle}>오류 발생</h3>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        ) : qrCodes.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyMessage}>등록된 QR 코드가 없습니다.</p>
          </div>
        ) : (
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
                  const daysElapsed = calculateDaysElapsed(qr.LAST_SCANNED_AT);
                  const isExpanded = expandedId === qr.ID;
                  const rowClass = `${styles.tableRow} ${
                    isExpanded ? styles.expandedRow : ""
                  } ${qr.LAST_SCANNED_AT ? styles.checkedRow : ""}`;

                  return (
                    <tr
                      key={qr.ID}
                      className={rowClass}
                      onClick={() => toggleRowExpand(qr.ID)}
                    >
                      <td>
                        <span
                          className={`${styles.badge} ${
                            qr.IS_COMPROMISED === 1
                              ? styles.compromised
                              : qr.LAST_SCANNED_AT
                              ? styles.safe
                              : styles.unchecked
                          }`}
                        >
                          {qr.IS_COMPROMISED === 1
                            ? "변조"
                            : qr.LAST_SCANNED_AT
                            ? "안전"
                            : "미점검"}
                        </span>
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          styles.descriptionCell
                        } ${isExpanded ? styles.expanded : styles.truncated}`}
                      >
                        {qr.DESCRIPTION}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          styles.addressCell
                        } ${isExpanded ? styles.expanded : styles.truncated}`}
                      >
                        {qr.ADDRESS}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${styles.urlCell} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {qr.ORIGINAL_URL}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${styles.urlCell} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {qr.LAST_SCANNED_URL || "-"}
                      </td>
                      <td
                        className={`${styles.cellCommon} ${
                          isExpanded ? styles.expanded : styles.truncated
                        }`}
                      >
                        {formatDate(qr.LAST_SCANNED_AT)}
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
                              handleInspect(qr.ID);
                            }}
                          >
                            점검
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(qr);
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

      {deleteTarget && (
        <DeleteModal
          qrCode={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
