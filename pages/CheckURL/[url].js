import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../styles/CheckURL.module.css";
import QRScanner from "@/app/components/QRScanner";

export default function CheckURLResult() {
  const router = useRouter();
  const { url } = router.query;

  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [urlhausResult, setUrlhausResult] = useState(null);
  const [virustotalResult, setVirustotalResult] = useState(null);
  const [error, setError] = useState(null);
  const [showVTModal, setShowVTModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // 페이지 로드 상태 관리
  useEffect(() => {
    setPageLoaded(true);
    return () => setPageLoaded(false);
  }, []);

  // QR 스캐너 자동 시작을 위한 useEffect
  useEffect(() => {
    if (showScanner && pageLoaded) {
      const timer = setTimeout(() => {
        const scannerElement = document.querySelector(
          '[data-testid="qr-scanner-button"]'
        );
        if (scannerElement) {
          scannerElement.click();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showScanner, pageLoaded]);

  useEffect(() => {
    // URL 파라미터가 있을 때만 API 호출
    if (url) {
      checkUrl(decodeURIComponent(url));
    }
  }, [url]);

  const checkUrl = async (targetUrl) => {
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
        body: JSON.stringify({ url: targetUrl }),
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
        body: JSON.stringify({ url: targetUrl }),
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

  // 새 URL 검사 핸들러
  const handleNewUrlCheck = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    router.push(`/CheckURL/${encodeURIComponent(newUrl.trim())}`);
  };

  // 엔터 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNewUrlCheck(e);
    }
  };

  // QR 스캔 성공 처리
  const handleScanSuccess = (decodedText) => {
    setNewUrl(decodedText);
    setShowScanner(false);
    // 스캔 결과로 바로 검색
    router.push(`/CheckURL/${encodeURIComponent(decodedText.trim())}`);
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
        {showScanner ? (
          <div className={styles.scannerContainer}>
            <QRScanner onScanSuccess={handleScanSuccess} />
            <button
              onClick={() => setShowScanner(false)}
              className={styles.cancelButton}
            >
              스캔 취소
            </button>
          </div>
        ) : (
          <>
            <div className={styles.searchContainer}>
              <form onSubmit={handleNewUrlCheck} className={styles.searchForm}>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="새 URL 또는 IP 주소 검사"
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className={styles.scanButton}
                >
                  QR 스캔
                </button>
                <button type="submit" className={styles.searchButton}>
                  검사하기
                </button>
              </form>
            </div>

            <div className={styles.urlInfoBox}>
              <h2 className={styles.urlTitle}>검사 대상</h2>
              <div className={styles.urlValue}>
                {url ? decodeURIComponent(url) : ""}
              </div>
            </div>

            {loading && (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>검사 중...</p>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className={styles.dashboard}>
                <URLHausDashboard result={urlhausResult} />
                <VirusTotalDashboard result={virustotalResult} />
              </div>
            )}

            {showVTModal && (
              <VirusTotalDetailModal
                result={virustotalResult}
                onClose={toggleVTModal}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
