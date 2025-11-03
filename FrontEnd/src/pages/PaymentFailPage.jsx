import React, { useEffect, useState } from "react";
import { Result, Button } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentFailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason || "Hệ thống đang bảo trì hoặc thanh toán bị gián đoạn.";
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          navigate("/");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-100/30 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl border border-red-100 max-w-lg w-full p-10 text-center relative z-10"
      >
        <CloseCircleFilled className="text-red-500 text-6xl mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Thanh Toán Thất Bại
        </h1>
        <p className="text-gray-600 mb-6">{reason}</p>

        <Result
          status="error"
          title="Không thể hoàn tất thanh toán"
          subTitle="Vui lòng thử lại hoặc kiểm tra kết nối mạng, phương thức thanh toán của bạn."
        />

        <div className="flex justify-center gap-4 mt-6">
          <Button
            type="default"
            href="/cart"
            size="large"
            className="rounded-lg px-6 py-2 border-red-400 text-red-500 hover:border-red-500 hover:text-red-600"
          >
            Quay Lại Giỏ Hàng
          </Button>
          <Button
            type="primary"
            href="/"
            size="large"
            className="rounded-lg px-6 py-2 bg-red-500 border-none text-white font-semibold hover:bg-red-600"
          >
            Trang Chủ
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Tự động trở về trang chủ sau <span className="font-semibold">{countdown}</span>s...
        </p>
      </motion.div>
    </div>
  );
}

export default PaymentFailPage;
