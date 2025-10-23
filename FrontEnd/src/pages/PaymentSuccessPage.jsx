import React from "react";
import { Result, Button } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { motion } from "framer-motion";

function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F3] p-6 relative overflow-hidden">
      {/* Soft glowing background decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#B8860B]/10 rounded-full blur-3xl"></div>

      {/* Animated success card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-2xl border border-[#E8E4DC] max-w-lg w-full p-10 text-center relative z-10"
      >
        <CheckCircleFilled className="text-[#D4AF37] text-6xl mb-4" />
        <h1 className="text-4xl font-serif font-extrabold text-[#2C2C2C] mb-3">
          Thanh Toán Thành Công!
        </h1>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Cảm ơn bạn đã tin tưởng và mua hàng tại <span className="text-[#B8860B] font-semibold">Cóc Mua Xe</span>.  
          Đơn hàng của bạn đang được xử lý.
        </p>

        <Result
          status="success"
          title={<span className="text-[#2C2C2C] font-serif text-xl">Đơn hàng đã được xác nhận</span>}
          subTitle={
            <span className="text-gray-600">
              Chúng tôi sẽ sớm gửi thông tin vận chuyển qua email và số điện thoại của bạn.
            </span>
          }
        />

        <div className="flex justify-center gap-4 mt-6">
          <Button
            type="default"
            href="/orders"
            size="large"
            className="rounded-lg px-6 py-2 border-[#B8860B] text-[#2C2C2C] hover:border-[#D4AF37] hover:text-[#B8860B]"
          >
            Xem Đơn Hàng
          </Button>
          <Button
            type="primary"
            href="/"
            size="large"
            className="rounded-lg px-6 py-2 bg-[#D4AF37] border-none text-[#2C2C2C] font-semibold hover:bg-[#B8860B]"
          >
            Quay Về Trang Chủ
          </Button>
        </div>
      </motion.div>

      {/* Floating confetti sparkles (pure CSS pseudo sparkle effect) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [Math.random() * 400 + 200],
              x: [Math.random() * 600 - 300],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute top-0 left-1/2 w-2 h-2 bg-[#D4AF37] rounded-full shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
