import React, { useState, useEffect } from "react";
import { getQRList, inspectQR, deleteQR } from "../../services/qrService";

const QRList = () => {
  const [qrList, setQRList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRList = async () => {
      try {
        const data = await getQRList();
        setQRList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQRList();
  }, []);

  const handleInspect = async (id) => {
    try {
      const scannedUrl = prompt("스캔된 URL을 입력하세요:");
      if (!scannedUrl) return;

      await inspectQR(id, scannedUrl);
      // 목록 새로고침
      const updatedData = await getQRList();
      setQRList(updatedData);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteQR(id);
      // 목록 새로고침
      const updatedData = await getQRList();
      setQRList(updatedData);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">QR 코드 목록</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">상태</th>
              <th className="px-4 py-2 border">설명</th>
              <th className="px-4 py-2 border">위치</th>
              <th className="px-4 py-2 border">URL</th>
              <th className="px-4 py-2 border">스캔된 URL</th>
              <th className="px-4 py-2 border">마지막 점검</th>
              <th className="px-4 py-2 border">경과</th>
              <th className="px-4 py-2 border">작업</th>
            </tr>
          </thead>
          <tbody>
            {qrList.map((qr) => (
              <tr key={qr.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      qr.is_compromised
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {qr.is_compromised ? "위험" : "안전"}
                  </span>
                </td>
                <td className="px-4 py-2 border">{qr.description || "-"}</td>
                <td className="px-4 py-2 border">{qr.address || "-"}</td>
                <td className="px-4 py-2 border">
                  <a
                    href={qr.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {qr.original_url}
                  </a>
                </td>
                <td className="px-4 py-2 border">
                  {qr.last_scanned_url ? (
                    <a
                      href={qr.last_scanned_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {qr.last_scanned_url}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {qr.last_scanned_at
                    ? new Date(qr.last_scanned_at).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-2 border">
                  {qr.last_scanned_at ? (
                    <span className="text-gray-600">
                      {Math.floor(
                        (new Date() - new Date(qr.last_scanned_at)) /
                          (1000 * 60 * 60)
                      )}
                      시간 전
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInspect(qr.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      점검
                    </button>
                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QRList;
