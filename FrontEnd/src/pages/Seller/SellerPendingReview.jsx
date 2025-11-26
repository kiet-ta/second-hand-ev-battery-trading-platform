import React, { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import walletApi from "../../api/walletApi";
import useKycRedirect from '../../hooks/useKycRedirect';

const SellerPendingReview = () => {
  useKycRedirect()
  const [status, setStatus] = useState("loading");
  const [wallet, setWallet] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStatus = async () => {
      const id = localStorage.getItem("userId");
      if (!id) return;

      try {
        const userData = await userApi.getUserByID(id);
        if (!userData) {
          setStatus("error");
          setMessage("Không tìm thấy thông tin người dùng.");
          return;
        }

        setUser(userData);

        if (userData.kycStatus === "Rejected") {
          setStatus("Rejected");
          setMessage("Hồ sơ KYC của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và gửi lại.");
          return;
        }

        if (userData.kycStatus === "Pending") {
          setStatus("Pending");
          setMessage("Hồ sơ của bạn đang được xét duyệt.");
          return;
        }

        if (userData.kycStatus === "Approved") {
          if (userData.paid === "Pending") {
            const w = await walletApi.getWalletByUser(id);
            setWallet(w);
            setStatus("needPayment");
            setMessage("Vui lòng thanh toán 100.000đ để hoàn tất kích hoạt tài khoản người bán.");
          } else {
            setStatus("Approved");
            setMessage("Tài khoản của bạn đã được kích hoạt đầy đủ!");
          }
        }
      } catch (error) {
        setStatus("error");
        setMessage("Không thể tải thông tin tài khoản.");
      }
    };

    fetchStatus();
  }, []);

  const handlePay = async () => {
    try {
      const id = localStorage.getItem("userId");
      if (!wallet || wallet.balance < 100000) {
        setMessage("Số dư ví không đủ để thanh toán 100.000đ.");
        return;
      }

      // Withdraw from wallet
      await walletApi.withdrawWallet({
        userId: id,
        amount: 100000,
        type: "Withdraw",
        ref: "Seller-Activation",
        description: "Thanh toán kích hoạt tài khoản người bán",
      });

      // Update user with all fields
      const updatedUser = {
        ...user,
        role: "Seller",
        paid: "Paid",
        updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      };
      await userApi.putUser(id, updatedUser);

      // Update state
      setWallet((prev) => ({ ...prev, balance: prev.balance - 100000 }));
      setUser(updatedUser);
      setStatus("Approved");
      setMessage("Thanh toán thành công! Tài khoản người bán đã được kích hoạt.");
    } catch (error) {
      setMessage("Giao dịch thất bại, vui lòng thử lại.");
    }
  };

  const formatVND = (v) => v?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-6 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        {status === "Pending" && (
          <>
            <ClockCircleOutlined className="text-yellow-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Hồ sơ đang xét duyệt
            </h1>
          </>
        )}

        {status === "Rejected" && (
          <>
            <CloseCircleOutlined className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Hồ sơ bị từ chối
            </h1>
          </>
        )}

        {status === "needPayment" && (
          <>
            <CheckCircleOutlined className="text-green-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Xác minh thành công
            </h1>
            <p className="text-gray-600 mb-2">
              {wallet ? `Số dư hiện tại: ${formatVND(wallet.balance)}` : "Đang tải số dư..."}
            </p>
            <Button
              type="primary"
              className="bg-[#D4AF37] text-black font-semibold mt-3"
              onClick={handlePay}
            >
              Thanh toán 100.000đ
            </Button>
          </>
        )}

        {status === "Approved" && (
          <>
            <CheckCircleOutlined className="text-green-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Tài khoản đã kích hoạt
            </h1>
            <Button type="primary" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </>
        )}

        <p
          className={`mt-4 text-sm font-medium ${
            status === "Rejected"
              ? "text-red-500"
              : status === "Pending"
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {message}
        </p>

        <div className="mt-6 text-gray-400 text-xs">
          {status === "Pending" && "Hệ thống sẽ gửi thông báo sau khi xét duyệt xong."}
          {status === "Rejected" && "Bạn có thể cập nhật hồ sơ và gửi lại."}
        </div>
      </div>
    </div>
  );
};

export default SellerPendingReview;
