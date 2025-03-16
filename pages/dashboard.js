import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qr/list");
      if (!response.ok) {
        throw new Error("데이터 로드 실패");
      }
      const data = await response.json();

      // 마지막 스캔 시간을 기준으로 정렬
      const sortedData = data.sort((a, b) => {
        if (!a.lastScannedAt) return -1;
        if (!b.lastScannedAt) return 1;
        return new Date(b.lastScannedAt) - new Date(a.lastScannedAt);
      });

      setQrCodes(sortedData);
    } catch (error) {
      alert("데이터 로드 실패: " + error.message);
    }
  };

  const handleInspectClick = (qrCode) => {
    router.push(`/inspect?qrId=${qrCode._id}`);
  };

  const filteredQRCodes = qrCodes.filter((qr) => {
    const matchesSearch =
      qr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "unchecked") return matchesSearch && !qr.lastScannedAt;
    if (filterStatus === "compromised")
      return matchesSearch && qr.isCompromised;
    if (filterStatus === "safe") return matchesSearch && !qr.isCompromised;
    return matchesSearch;
  });

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>QR 코드 모니터링 대시보드</h1>

        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="unchecked">미점검</option>
            <option value="compromised">변조됨</option>
            <option value="safe">안전</option>
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상태</th>
                <th>설명</th>
                <th>위치</th>
                <th>원본 URL</th>
                <th>마지막 스캔</th>
                <th>마지막 스캔 URL</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredQRCodes.map((qr) => (
                <tr
                  key={qr._id}
                  className={`${styles.tableRow} ${
                    qr.lastScannedAt ? styles.checkedRow : styles.uncheckedRow
                  }`}
                >
                  <td>
                    <span
                      className={`${styles.badge} ${
                        !qr.lastScannedAt
                          ? styles.badgeWarning
                          : qr.isCompromised
                          ? styles.badgeRed
                          : styles.badgeGreen
                      }`}
                    >
                      {!qr.lastScannedAt
                        ? "미점검"
                        : qr.isCompromised
                        ? "변조됨"
                        : "안전"}
                    </span>
                  </td>
                  <td>{qr.description}</td>
                  <td>{qr.location.address}</td>
                  <td>
                    <a
                      href={qr.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {qr.originalUrl}
                    </a>
                  </td>
                  <td>
                    {qr.lastScannedAt
                      ? new Date(qr.lastScannedAt).toLocaleString("ko-KR")
                      : "-"}
                  </td>
                  <td>
                    {qr.lastScannedUrl ? (
                      <a
                        href={qr.lastScannedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        {qr.lastScannedUrl}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button
                      className={`${styles.button} ${
                        qr.lastScannedAt
                          ? styles.buttonDisabled
                          : styles.buttonPrimary
                      }`}
                      onClick={() => handleInspectClick(qr)}
                      disabled={qr.lastScannedAt}
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
