import React from "react";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import useKycRedirect from "../../hooks/useKycRedirect";

const SellerPendingReview = () => {
  useKycRedirect();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <ClockCircleOutlined className="text-yellow-500 text-6xl mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Hồ sơ của bạn đang được xét duyệt
        </h1>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã gửi thông tin xác minh. Hệ thống đang kiểm tra hồ sơ của bạn.
          Vui lòng chờ thông báo kết quả trong thời gian sớm nhất.
        </p>

        <div className="flex justify-center space-x-4">
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
          <Button onClick={() => navigate("/profile")}>Xem hồ sơ</Button>
        </div>

        <div className="mt-6 text-gray-400 text-sm flex items-center justify-center">
          <CheckCircleOutlined className="mr-1" /> 
          Hệ thống sẽ gửi thông báo sau khi xét duyệt xong.
        </div>
      </div>
    </div>
  );
};

export default SellerPendingReview;
