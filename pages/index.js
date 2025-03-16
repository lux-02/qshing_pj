import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Dashboard.module.css";
import DeleteModal from "../app/components/DeleteModal";
import LoadingSpinner from "../app/components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/qr/list");
        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setQrCodes(data);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        alert("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
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
      if (!a.lastScannedAt && b.lastScannedAt) return -1;
      if (a.lastScannedAt && !b.lastScannedAt) return 1;

      // 둘 다 점검된 경우, 최근 점검일 기준으로 정렬
      if (a.lastScannedAt && b.lastScannedAt) {
        return new Date(b.lastScannedAt) - new Date(a.lastScannedAt);
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
            (qr.originalUrl?.toLowerCase() || "").includes(searchLower)
          );
        }
        return true;
      })
      .filter((qr) => {
        // 상태 필터링
        switch (filter) {
          case "compromised":
            return qr.isCompromised;
          case "safe":
            return qr.lastScannedAt && !qr.isCompromised;
          case "unchecked":
            return !qr.lastScannedAt;
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

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/qr/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      // 성공적으로 삭제된 경우 목록에서 제거
      setQrCodes((prevCodes) => prevCodes.filter((qr) => qr._id !== id));
      alert("QR 코드가 삭제되었습니다.");
    } catch (error) {
      alert("삭제 실패: " + error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>QShing Inspect Dashboard</h1>

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
            데이터 등록
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableRow}>
                  <th>URL</th>
                  <th>설명</th>
                  <th>설치 위치</th>
                  <th>스캔된 URL</th>
                  <th>마지막 점검</th>
                  <th>경과</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredQRCodes.map((qr) => {
                  const daysElapsed = calculateDaysElapsed(qr.lastScannedAt);
                  const needsInspection = !qr.lastScannedAt || qr.isCompromised;

                  return (
                    <tr
                      key={qr._id}
                      onClick={() => toggleRowExpand(qr._id)}
                      className={`${styles.tableRow} ${
                        expandedId === qr._id ? styles.expandedRow : ""
                      } ${qr.lastScannedAt ? styles.checkedRow : ""}`}
                    >
                      <td className={`${styles.urlCell} ${styles.truncated}`}>
                        {qr.originalUrl}
                      </td>
                      <td
                        className={`${styles.descriptionCell} ${styles.truncated}`}
                      >
                        {qr.description}
                      </td>
                      <td
                        className={`${styles.addressCell} ${styles.truncated}`}
                      >
                        {qr.address}
                      </td>
                      <td className={`${styles.urlCell} ${styles.truncated}`}>
                        {qr.lastScannedUrl || "-"}
                      </td>
                      <td>{formatDate(qr.lastScannedAt)}</td>
                      <td>{daysElapsed ? `D+${daysElapsed}` : "-"}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            !qr.lastScannedAt
                              ? styles.unchecked
                              : qr.isCompromised
                              ? styles.compromised
                              : styles.safe
                          }`}
                        >
                          {!qr.lastScannedAt
                            ? "미점검"
                            : qr.isCompromised
                            ? "변조됨"
                            : "안전"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspect(qr._id);
                            }}
                            className={styles.inspectButton}
                            disabled={!needsInspection}
                          >
                            {qr.isCompromised ? "재점검" : "점검"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(qr._id);
                            }}
                            className={styles.deleteButton}
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
      </main>

      {deleteTarget && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
