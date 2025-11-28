import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import addressApi from "../../hooks/services/addressApi";
import { ghnApi } from "../../hooks/services/ghnApi";
import walletApi from "../../api/walletApi";
import { FiMapPin, FiX } from "react-icons/fi";

// Modal chọn địa chỉ
const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 animate-fadeIn">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">Chọn địa chỉ giao hàng</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiX size={22} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        <div className="space-y-3">
          {addresses.length > 0 ? (
            addresses.map((addr) => (
              <div
                key={addr.addressId}
                onClick={() => onSelect(addr.addressId)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedId === addr.addressId
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
                    <span className="text-xs bg-[#EEE8AA] text-gray-800 font-semibold px-2 py-1 rounded-full shadow-sm">
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
            className="px-5 py-2.5 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-lg shadow hover:bg-[#B8860B] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const pollingIntervalRef = useRef(null);

  const [shippingFee, setShippingFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("payos");
  const [wallet, setWallet] = useState(null);

  // Fetch địa chỉ người dùng
  useEffect(() => {
    const fetchAddresses = async () => {
      const userId = localStorage.getItem("userId");
      const res = await addressApi.getUserAddresses(userId);
      if (res && Array.isArray(res)) {
        const preSelected = orderData?.selectedAddressId;
        let sortedAddresses = res;
        if (preSelected) {
          sortedAddresses = [
            res.find((a) => a.addressId === preSelected),
            ...res.filter((a) => a.addressId !== preSelected),
          ];
        }
        setAddresses(sortedAddresses);
        setSelectedAddressId(preSelected || sortedAddresses[0]?.addressId);
      }
    };
    fetchAddresses();
  }, [location.state]);

  // Fetch ví người dùng
  useEffect(() => {
    const fetchWallet = async () => {
      const userId = localStorage.getItem("userId");
      const w = await walletApi.getWalletByUser(userId);
      setWallet(w);
    };
    fetchWallet();
  }, []);

  // Tính phí ship
  const selectedDeliveryAddress = addresses.find((a) => a.addressId === selectedAddressId);

  useEffect(() => {
    const fetchShippingFee = async () => {
      if (!selectedDeliveryAddress?.districtCode || !selectedDeliveryAddress?.wardCode) return;
      setLoadingFee(true);

      const feeResult = await ghnApi.calcFee({
        toDistrictId: selectedDeliveryAddress.districtCode,
        toWardCode: selectedDeliveryAddress.wardCode,
        weight: 2000,
      });

      setShippingFee(feeResult?.error ? 0 : feeResult || 0);
      setLoadingFee(false);
    };

    fetchShippingFee();
  }, [selectedDeliveryAddress]);

  const formatVND = (p) => p.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const totalItemsPrice = orderData.itemsToPurchase.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const finalTotalPrice = totalItemsPrice + shippingFee;

  // MAIN PAYMENT HANDLER -----------------------
  const handleConfirmAndPay = async () => {
    setIsProcessing(true);

    if (!selectedDeliveryAddress) {
      setStatusMessage("Vui lòng chọn địa chỉ giao hàng.");
      setIsProcessing(false);
      return;
    }

    // 🔥 Open popup early (fix popup blocked issue)
    let payWindow = null;
    if (paymentMethod === "PayOS") {
      payWindow = window.open("", "_blank");
    }

    try {
      // Create the order
      const orderPayload = {
        buyerId: parseInt(localStorage.getItem("userId"), 10),
        addressId: selectedDeliveryAddress.addressId,
        orderItemIds: orderData.orderItemIds,
        shippingPrice: shippingFee || 0,
        createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      };

      const orderResponse = await orderApi.postOrderNew(orderPayload);

      // WALLET PAYMENT
      if (paymentMethod === "wallet") {
        if (!wallet || wallet.balance < finalTotalPrice) {
          setIsProcessing(false);
          setStatusMessage("Số dư ví không đủ.");
          return;
        }

        await walletApi.withdrawWallet({
          userId: parseInt(localStorage.getItem("userId"), 10),
          userRole: 'Buyer',
          amount: finalTotalPrice,
          type: "Withdraw",
          orderId: orderResponse.orderId,
          itemId: orderData.itemsToPurchase[0].itemId,
          description: `Thanh toán đơn hàng ${orderResponse.orderId}`,
        });

        setWallet((prev) => ({ ...prev, balance: prev.balance - finalTotalPrice }));

        navigate("/payment/success", { state: { method: "wallet", amount: finalTotalPrice } });
        return;
      }

      // PAYOS PAYMENT ---------------------------
      const paymentPayload = {
        userId: parseInt(localStorage.getItem("userId"), 10),
        method: "PayOS",
        totalAmount: finalTotalPrice,
        details: orderData.itemsToPurchase.map((i) => ({
          orderId: orderResponse.orderId,
          itemId: i.itemId,
          amount: finalTotalPrice,
        })),
      };

      const link = await paymentApi.createPaymentLink(paymentPayload);

      if (!link?.checkoutUrl) {
        payWindow.close();
        throw new Error("Không tạo được link thanh toán.");
      }

      // Now redirect the reserved popup
      payWindow.location.href = link.checkoutUrl;

      // Polling for window close
      pollingIntervalRef.current = setInterval(() => {
        if (payWindow && payWindow.closed) {
          clearInterval(pollingIntervalRef.current);
          navigate("/payment/fail", {
            state: {
              reason: "Cửa sổ thanh toán đã đóng.",
              method: "PayOS",
              orderId: orderResponse.orderId,
              orderCode: link.orderCode,
            },
          });
        }
      }, 2000);
    } catch (err) {
      navigate("/payment/fail", { state: { reason: "Không thể hoàn tất đơn hàng." } });
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------------------------------

  if (!orderData?.itemsToPurchase?.length)
    return <div className="p-6 bg-gray-100 min-h-screen text-center">Không có dữ liệu.</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Địa chỉ giao hàng */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-[#C99700] flex items-center gap-2">
            <FiMapPin /> Địa chỉ giao hàng
          </h2>

          {selectedDeliveryAddress ? (
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-bold text-gray-800">
                  {selectedDeliveryAddress.recipientName} | {selectedDeliveryAddress.phone}
                </p>
                <p className="text-gray-600">
                  {`${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.ward}, ${selectedDeliveryAddress.district}, ${selectedDeliveryAddress.province}`}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-500 hover:underline font-semibold ml-4"
              >
                Thay đổi
              </button>
            </div>
          ) : (
            <p className="text-red-500">Không có địa chỉ giao hàng nào được chọn.</p>
          )}
        </div>

        {/* Sản phẩm */}
        <h2 className="text-lg font-semibold mb-4">Sản phẩm đặt mua</h2>
        <div className="divide-y">
          {orderData.itemsToPurchase.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.images[0].imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center space-x-12">
                <p className="w-24 text-center">{formatVND(item.price)}</p>
                <p className="w-16 text-center">{item.quantity}</p>
                <p className="w-28 text-right font-semibold">
                  {formatVND(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ship */}
        <div className="flex justify-between items-center py-4 border-t">
          <p>Vận chuyển nhanh (GHN)</p>
          <p className="font-semibold">
            {loadingFee ? "Đang tính..." : formatVND(shippingFee || 0)}
          </p>
        </div>

        {/* Payment Method */}
        <div className="flex justify-between items-center py-4 border-t">
          <p>Phương thức thanh toán</p>
          <div className="flex gap-4">
            <button
              onClick={() => setPaymentMethod("payos")}
              className={`px-4 py-2 rounded-lg font-semibold border ${paymentMethod === "payos"
                ? "bg-[#C99700] text-white border-[#C99700]"
                : "bg-white border-gray-300"
                }`}
            >
              PayOS
            </button>

            <button
              onClick={() => setPaymentMethod("wallet")}
              className={`px-4 py-2 rounded-lg font-semibold border ${paymentMethod === "wallet"
                ? "bg-[#C99700] text-white border-[#C99700]"
                : "bg-white border-gray-300"
                }`}
            >
              Ví ({wallet ? formatVND(wallet.balance) : "Đang tải..."})
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center border-t pt-6">
          <p className="text-lg font-semibold">
            Tổng cộng ({orderData.itemsToPurchase.length} sản phẩm):
          </p>
          <p className="text-2xl font-bold text-[#D4AF37]">
            {formatVND(finalTotalPrice)}
          </p>
        </div>

        {/* Action Button */}
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

      {/* Modal */}
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
