import React from "react";

const steps = ["pending", "paid", "shipped", "completed"];
const labels = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  shipped: "Đang giao hàng",
  completed: "Hoàn tất",
};

const OrderStatusBar = ({ status }) => {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center justify-between mt-4 mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center w-full">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              index <= currentIndex ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {index + 1}
          </div>
          <p
            className={`text-xs mt-1 ${
              index <= currentIndex ? "text-green-600" : "text-gray-400"
            }`}
          >
            {labels[step]}
          </p>
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-full ${
                index < currentIndex ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStatusBar;
