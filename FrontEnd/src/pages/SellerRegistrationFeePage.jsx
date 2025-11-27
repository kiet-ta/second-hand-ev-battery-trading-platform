import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import walletApi from "../api/walletApi";
import commissionApi from "../api/commissionApi";
import userApi from "../api/userApi";

export default function SellerRegistrationFeePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [fee, setFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const userData = await userApi.getUserByID(userId);
        setUser(userData);

        if (userData.kycStatus !== "Approved") {
          setError("Hồ sơ của bạn chưa được duyệt.");
          return;
        }

        let feeData;

        if (userData.isStore) {
          feeData = await commissionApi.getCommissionByFeeCode("FEESR"); // Store Seller Registration Fee
        } else {
          feeData = await commissionApi.getCommissionByFeeCode("FEEPR"); // Personal Seller Registration Fee
        }

        setFee(feeData.feeValue);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu phí.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePay = async () => {
    try {
      setError(null);

      const wallet = await walletApi.getWalletByUser(userId);

      if (wallet.balance < fee) {
        setError("Số dư ví không đủ. Vui lòng nạp thêm.");
        return;
      }

      // 1. Withdraw registration fee
      await walletApi.withdrawWallet({
        userId,
        amount: fee,
        type: "Withdraw",
        ref: userId,
        description: "Phí đăng ký Seller"
      });
      await walletApi.revenueWallet({
        userId: 4, 
        amount: fee,
        type: "Revenue",
        ref: userId,
        description: "Phí đăng ký Seller"
      });
      // 2. Update user to registered
      await userApi.putUser(userId, {
        ...user,
        paid: "Registered",
        updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString()
      });

      navigate("/seller"); 
    } catch (err) {
      console.error(err);
      setError("Thanh toán thất bại.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-gray-500">
        Đang tải...
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-lg text-center border">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />

        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Hồ sơ Seller đã được duyệt!
        </h1>

        <p className="text-gray-600 mt-2 leading-relaxed">
          Để hoàn tất việc trở thành <strong>Seller</strong>, bạn cần thanh toán
          phí đăng ký.
        </p>

        <div className="bg-gray-100 p-4 rounded-xl w-full text-left mt-4">
          <p className="text-gray-700 font-medium">Phí đăng ký:</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{fee} đ</p>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          onClick={handlePay}
          className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Thanh toán ngay
        </button>
      </div>
    </div>
  );
}
