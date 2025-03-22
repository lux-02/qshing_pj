import { useState } from "react";
import QRScanner from "@/app/components/QRScanner";

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const response = await fetch("/api/qr/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalUrl: url,
        description: description || "",
        address: address || "",
      }),
    });

    if (!response.ok) {
      throw new Error("QR 코드 등록에 실패했습니다.");
    }

    const data = await response.json();
    setMessage("QR 코드가 성공적으로 등록되었습니다.");
    setShowMessage(true);
    setUrl("");
    setDescription("");
    setAddress("");
  } catch (error) {
    setMessage(error.message);
    setShowMessage(true);
  } finally {
    setIsSubmitting(false);
  }
};

const handleScan = async () => {
  try {
    const result = await QRScanner.scan();
    if (result) {
      setUrl(result);
    }
  } catch (error) {
    console.error("QR 스캔 오류:", error);
    setMessage("QR 스캔에 실패했습니다.");
    setShowMessage(true);
  }
};
