import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Dashboard.module.css";

export default function Home() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qr/list");
      if (!response.ok) {
        throw new Error("QR 코드 목록을 불러올 수 없습니다.");
      }
      const data = await response.json();
      setQrCodes(data);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleInspect = (qrId) => {
    router.push(`/inspect?qrId=${qrId}`);
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredQRCodes = qrCodes
    .filter((qr) => {
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
    });

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

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상태</th>
                <th>URL</th>
                <th>설명</th>
                <th>설치 위치</th>
                <th>마지막 점검</th>

                <th>작업</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredQRCodes.map((qr) => (
                <tr
                  key={qr._id}
                  onClick={() => toggleRowExpand(qr._id)}
                  className={`${styles.tableRow} ${
                    expandedRows[qr._id] ? styles.expandedRow : ""
                  }`}
                >
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
                  <td className={`${styles.urlCell} ${styles.truncated}`}>
                    {qr.originalUrl}
                  </td>
                  <td
                    className={`${styles.descriptionCell} ${styles.truncated}`}
                  >
                    {qr.description}
                  </td>
                  <td className={`${styles.addressCell} ${styles.truncated}`}>
                    {qr.address}
                  </td>
                  <td>
                    {qr.lastScannedAt
                      ? new Date(qr.lastScannedAt).toLocaleString()
                      : "미점검"}
                  </td>

                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspect(qr._id);
                      }}
                      className={styles.inspectButton}
                    >
                      점검
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
