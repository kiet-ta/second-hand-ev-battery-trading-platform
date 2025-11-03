import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import walletApi from "../../api/walletApi";
import { ghnApi } from "../../hooks/services/ghnApi";
import { FiMapPin, FiX } from "react-icons/fi";

const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h3 className="text-xl font-bold text-gray-800">Chọn địa chỉ giao hàng</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
          <FiX size={22} className="text-gray-600 hover:text-gray-800" />
        </button>
      </div>
      <div className="space-y-3">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <div
              key={addr.addressId}
              onClick={() => onSelect(addr.addressId)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedId === addr.addressId
                  ? "border-[#C99700] bg-[#FFF8E1]"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {addr.recipientName} | {addr.phone}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                  </p>
                </div>
                {addr.isDefault && (
                  <span className="text-xs bg-[#EEE8AA] text-gray-800 font-semibold px-2 py-1 rounded-full">
                    Mặc định
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6">Không tìm thấy địa chỉ nào.</p>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-lg shadow hover:bg-[#B8860B]"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
);

function BuyNowCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedData = localStorage.getItem("checkoutData");
  const orderData = location.state || (savedData ? JSON.parse(savedData) : null);

  const [addresses, setAddresses] = useState(orderData?.allAddresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(orderData?.selectedAddressId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("payos");

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const pollingIntervalRef = useRef(null);

  const insurance = { name: "Bảo hiểm hư hỏng sản phẩm", price: 6000 };
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);

  const selectedDeliveryAddress = addresses.find(
    (addr) => addr.addressId === selectedAddressId
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchWallet = async () => {
      try {
        const w = await walletApi.getWalletByUser(userId);
        setWallet(w);
      } catch (err) {
        console.error("Không tải được ví:", err);
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    if (!selectedDeliveryAddress?.districtCode || !selectedDeliveryAddress?.wardCode) return;
    const fetchShippingFee = async () => {
      setLoadingFee(true);
      try {
        const fee = await ghnApi.calcFee({
          toDistrictId: selectedDeliveryAddress.districtCode,
          toWardCode: selectedDeliveryAddress.wardCode,
          weight: 2000,
        });
        setShippingFee(fee?.error ? 0 : fee || 0);
      } catch {
        setShippingFee(0);
      } finally {
        setLoadingFee(false);
      }
    };
    fetchShippingFee();
  }, [selectedDeliveryAddress]);

  const formatVND = (p) =>
    p.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const calculateTotal = () => (orderData.totalAmount || 0) + insurance.price + shippingFee;
  const finalTotalPrice = calculateTotal();

  const handleConfirmAndPay = async () => {
    if (!selectedDeliveryAddress) {
      setStatusMessage("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("");

    try {
      const orderItemIds = orderData.orderItems.map((i) => i.id);
      const orderPayload = {
        buyerId: localStorage.getItem("userId"),
        addressId: selectedDeliveryAddress.addressId,
        orderItemIds,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      const orderResponse = await orderApi.postOrderNew(orderPayload);
      if (!orderResponse?.orderId) throw new Error("Không tạo được đơn hàng.");

      if (paymentMethod === "wallet") {
        if (!wallet || wallet.balance < finalTotalPrice) {
          setIsProcessing(false);
          setStatusMessage("Số dư ví không đủ.");
          return;
        }

        await walletApi.withdrawWallet({
          userId: localStorage.getItem("userId"),
          amount: finalTotalPrice,
          type: "withdraw",
          ref: orderResponse.orderId,
          description: `Thanh toán đơn hàng ${orderResponse.orderId}`,
        });

        setWallet((prev) => ({ ...prev, balance: prev.balance - finalTotalPrice }));
        navigate("/payment/success", { state: { method: "wallet", amount: finalTotalPrice } });
      } else {
        const paymentPayload = {
          userId: localStorage.getItem("userId"),
          method: "payos",
          totalAmount: finalTotalPrice,
          details: [{ orderId: orderResponse.orderId, amount: finalTotalPrice }],
        };

        const link = await paymentApi.createPaymentLink(paymentPayload);
        const { checkoutUrl } = link;
        if (!checkoutUrl) throw new Error("Không tạo được link thanh toán.");

        const paymentWindow = window.open(
          checkoutUrl,
          "Thanh toán PayOS",
          "width=800,height=600"
        );

        pollingIntervalRef.current = setInterval(() => {
          if (paymentWindow && paymentWindow.closed) {
            clearInterval(pollingIntervalRef.current);
            setIsProcessing(false);
            navigate("/payment/fail", { state: { reason: "Cửa sổ thanh toán đã đóng." } });
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Thanh toán lỗi:", err);
      navigate("/payment/fail", { state: { reason: "Không thể hoàn tất đơn hàng." } });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderData?.orderItems?.length)
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        Không tìm thấy dữ liệu thanh toán.
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-[#C99700] flex items-center gap-2">
            <FiMapPin /> Địa chỉ giao hàng
          </h2>
          {selectedDeliveryAddress ? (
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-bold text-gray-800">
                  {selectedDeliveryAddress.recipientName} |{" "}
                  {selectedDeliveryAddress.phone}
                </p>
                <p className="text-gray-600">
                  {`${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.ward}, ${selectedDeliveryAddress.district}, ${selectedDeliveryAddress.province}`}
                </p>
              </div>
              <button
                className="text-blue-500 hover:underline font-semibold ml-4"
                onClick={() => setIsModalOpen(true)}
              >
                Thay đổi
              </button>
            </div>
          ) : (
            <p className="text-red-500">Không có địa chỉ giao hàng nào được chọn.</p>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-4">Sản phẩm đặt mua</h2>
        <div className="divide-y">
          {orderData.orderItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-[#C99700]">
                {formatVND(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-4 border-t">
          <p>{insurance.name}</p>
          <p className="font-semibold">{formatVND(insurance.price)}</p>
        </div>
        <div className="flex justify-between items-center py-4 border-t">
          <p>Vận chuyển nhanh (GHN)</p>
          <p className="font-semibold">
            {loadingFee ? "Đang tính..." : formatVND(shippingFee || 0)}
          </p>
        </div>

        <div className="flex justify-between items-center py-4 border-t">
          <p>Phương thức thanh toán</p>
          <div className="flex gap-4">
            <button
              onClick={() => setPaymentMethod("payos")}
              className={`px-4 py-2 rounded-lg font-semibold border ${
                paymentMethod === "payos"
                  ? "bg-[#C99700] text-white border-[#C99700]"
                  : "bg-white border-gray-300"
              }`}
            >
              PayOS
            </button>
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={`px-4 py-2 rounded-lg font-semibold border ${
                paymentMethod === "wallet"
                  ? "bg-[#C99700] text-white border-[#C99700]"
                  : "bg-white border-gray-300"
              }`}
            >
              Ví ({wallet ? formatVND(wallet.balance) : "Đang tải..."})
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-6">
          <p className="text-lg font-semibold">
            Tổng cộng ({orderData.orderItems.length} sản phẩm):
          </p>
          <p className="text-2xl font-bold text-[#D4AF37]">{formatVND(finalTotalPrice)}</p>
        </div>

        <div className="flex flex-col items-end mt-6">
          {statusMessage && (
            <p className="text-red-500 mb-2 font-semibold">{statusMessage}</p>
          )}
          <button
            onClick={handleConfirmAndPay}
            disabled={isProcessing || !selectedDeliveryAddress}
            className="px-6 py-3 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-lg shadow hover:bg-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddressModal
          addresses={addresses}
          selectedId={selectedAddressId}
          onSelect={(id) => {
            setSelectedAddressId(id);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default BuyNowCheckoutPage;
