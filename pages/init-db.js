import { useState } from "react";

export default function InitDB() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const initializeTable = async () => {
    try {
      setLoading(true);
      setStatus("테이블 초기화 중...");

      const response = await fetch("/api/qr/init-table", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("성공: " + data.message);
      } else {
        setStatus("실패: " + data.error);
      }
    } catch (error) {
      setStatus("오류 발생: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8">데이터베이스 초기화</h2>
                <button
                  onClick={initializeTable}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white font-semibold rounded-lg shadow-md ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "처리 중..." : "QR 코드 테이블 초기화"}
                </button>
                {status && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      status.startsWith("성공")
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
