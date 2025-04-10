import { useState } from "react";
import styles from "../styles/CheckURL.module.css";

export default function CheckURL() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlhausResult, setUrlhausResult] = useState(null);
  const [virustotalResult, setVirustotalResult] = useState(null);
  const [error, setError] = useState(null);
  const [showVTModal, setShowVTModal] = useState(false);

  const handleCheck = async () => {
    if (!url) {
      setError("URL을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setUrlhausResult(null);
    setVirustotalResult(null);

    try {
      // URL HAUS API 호출
      const urlhausResponse = await fetch("/api/check-urlhaus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const urlhausData = await urlhausResponse.json();
      if (!urlhausResponse.ok) {
        throw new Error(urlhausData.error || "URL HAUS 검사에 실패했습니다.");
      }
      setUrlhausResult(urlhausData);

      // VirusTotal API 호출
      const virustotalResponse = await fetch("/api/check-virustotal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const virustotalData = await virustotalResponse.json();
      if (!virustotalResponse.ok) {
        throw new Error(
          virustotalData.error || "VirusTotal 검사에 실패했습니다."
        );
      }
      setVirustotalResult(virustotalData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  // 모달 열기/닫기 처리
  const toggleVTModal = () => {
    setShowVTModal(!showVTModal);
  };

  // URLhaus 대시보드 컴포넌트
  const URLHausDashboard = ({ result }) => {
    if (!result) return null;

    const isThreat = result.threat !== "none";

    return (
      <div className={styles.resultContainer}>
        <div className={styles.resultHeader}>
          <h2 className={styles.resultTitle}>
            <span className={styles.apiLogo}>URLhaus</span> 검사 결과
          </h2>
          <span className={`${styles.statusBadge} ${styles.completed}`}>
            검사 완료
          </span>
        </div>

        <div className={styles.resultBody}>
          <div className={styles.threatIndicator}>
            <div className={styles.threatLabel}>위협 수준</div>
            <div
              className={`${styles.threatValue} ${
                isThreat ? styles.malicious : styles.safe
              }`}
            >
              {isThreat ? "악성" : "안전"}
            </div>
          </div>

          {isThreat && result.threat_type && (
            <div className={styles.threatTypeBox}>
              <div className={styles.threatTypeLabel}>위협 유형</div>
              <div className={styles.threatType}>{result.threat_type}</div>
            </div>
          )}

          <div className={styles.messageBox}>
            <p className={styles.message}>{result.message}</p>
          </div>

          {result.tags && result.tags.length > 0 && (
            <div className={styles.tagsBox}>
              <div className={styles.tagsTitle}>관련 태그</div>
              <div className={styles.tagsList}>
                {result.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {result.reference && (
          <div className={styles.resultFooter}>
            <a
              href={result.reference}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.detailLink}
            >
              URLhaus에서 자세히 보기
            </a>
          </div>
        )}
      </div>
    );
  };

  // VirusTotal 대시보드 컴포넌트
  const VirusTotalDashboard = ({ result }) => {
    if (!result) return null;

    const isThreat = result.threat !== "none";
    const isUnknown = result.threat === "unknown";
    const maliciousDetails = result.analysis_stats?.malicious_details || [];

    return (
      <div className={styles.resultContainer}>
        <div className={styles.resultHeader}>
          <h2 className={styles.resultTitle}>
            <span className={styles.apiLogo}>VirusTotal</span> 검사 결과
          </h2>
          <span className={`${styles.statusBadge} ${styles.completed}`}>
            검사 완료
          </span>
        </div>

        <div className={styles.resultBody}>
          <div className={styles.threatIndicator}>
            <div className={styles.threatLabel}>위협 수준</div>
            <div
              className={`${styles.threatValue} ${
                isThreat
                  ? styles.malicious
                  : isUnknown
                  ? styles.unknown
                  : styles.safe
              }`}
            >
              {isThreat ? "악성" : isUnknown ? "알 수 없음" : "안전"}
            </div>
          </div>

          <div className={styles.messageBox}>
            <p className={styles.message}>{result.message}</p>
          </div>

          {result.analysis_stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statCount}>
                  {result.analysis_stats.malicious || 0}
                </div>
                <div className={styles.statLabel}>악성 판정</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statCount}>
                  {result.analysis_stats.suspicious || 0}
                </div>
                <div className={styles.statLabel}>의심스러움</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statCount}>
                  {result.analysis_stats.harmless || 0}
                </div>
                <div className={styles.statLabel}>무해</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statCount}>
                  {result.analysis_stats.undetected || 0}
                </div>
                <div className={styles.statLabel}>미분류</div>
              </div>
            </div>
          )}

          {maliciousDetails.length > 0 && (
            <div className={styles.maliciousDetails}>
              <div className={styles.detailsTitle}>악성 판정 세부 정보</div>
              <ul className={styles.detailsList}>
                {maliciousDetails.map((detail, index) => (
                  <li key={index} className={styles.detailItem}>
                    <span className={styles.engineName}>{detail.engine}:</span>{" "}
                    {detail.result}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.analysis_results && (
            <button className={styles.detailButton} onClick={toggleVTModal}>
              모든 검사 결과 상세 보기
            </button>
          )}
        </div>

        {result.virustotal_url && (
          <div className={styles.resultFooter}>
            <a
              href={result.virustotal_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.detailLink}
            >
              VirusTotal에서 자세히 보기
            </a>
          </div>
        )}
      </div>
    );
  };

  // VirusTotal 분석 결과 상세 모달
  const VirusTotalDetailModal = ({ result, onClose }) => {
    if (!result || !result.analysis_results) return null;

    const analysisResults = result.analysis_results;
    const categories = {
      malicious: { title: "악성", results: [] },
      suspicious: { title: "의심스러움", results: [] },
      harmless: { title: "무해", results: [] },
      undetected: { title: "미분류", results: [] },
    };

    // 분석 결과를 카테고리별로 분류
    Object.entries(analysisResults).forEach(([engine, data]) => {
      if (categories[data.category]) {
        categories[data.category].results.push({
          engine,
          ...data,
        });
      }
    });

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>VirusTotal 상세 검사 결과</h3>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.modalTabs}>
              {Object.entries(categories).map(([key, category]) => (
                <div key={key} className={styles.categorySection}>
                  <h4 className={styles.categoryTitle}>
                    {category.title} ({category.results.length})
                  </h4>
                  {category.results.length > 0 ? (
                    <table className={styles.resultsTable}>
                      <thead>
                        <tr>
                          <th>분석 엔진</th>
                          <th>결과</th>
                          <th>분석 방법</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.results.map((item, index) => (
                          <tr key={index}>
                            <td className={styles.engineCell}>
                              {item.engine_name || item.engine}
                            </td>
                            <td className={styles.resultCell}>{item.result}</td>
                            <td className={styles.methodCell}>{item.method}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className={styles.noResults}>결과 없음</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.closeModalButton} onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.scanBox}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검사할 URL 또는 IP 주소 입력 (예: www.example.com, 8.8.8.8)"
            className={styles.input}
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className={styles.checkButton}
          >
            {loading ? "검사 중..." : "검사하기"}
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.dashboard}>
          <URLHausDashboard result={urlhausResult} />
          <VirusTotalDashboard result={virustotalResult} />
        </div>

        {showVTModal && (
          <VirusTotalDetailModal
            result={virustotalResult}
            onClose={toggleVTModal}
          />
        )}
      </main>
    </div>
  );
}
