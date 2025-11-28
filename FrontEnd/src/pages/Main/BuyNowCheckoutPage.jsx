import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import { ghnApi } from "../../hooks/services/ghnApi";
import walletApi from "../../api/walletApi";
import auctionApi from "../../api/auctionApi"; // <-- new import
import { FiMapPin, FiX } from "react-icons/fi";
import orderItemApi from "../../api/orderItemApi";

const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => (
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
          addresses.map(addr => (
            <div
              key={addr.addressId}
              onClick={() => onSelect(addr.addressId)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedId === addr.addressId ? "border-[#C99700] bg-[#FFF8E1]" : "border-gray-200 hover:border-gray-400"
                }`}
            >
              <p className="font-semibold text-gray-800">{addr.recipientName} | {addr.phone}</p>
              <p className="text-gray-600 text-sm mt-1">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
              {addr.isDefault && (
                <span className="text-xs bg-[#EEE8AA] text-gray-800 font-semibold px-2 py-1 rounded-full shadow-sm">
                  Mặc định
                </span>
              )}
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

export default function BuyNowCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const saved = localStorage.getItem("checkoutData");
  const checkoutData = location.state || (saved ? JSON.parse(saved) : null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addresses, setAddresses] = useState(checkoutData?.allAddresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(checkoutData?.selectedAddressId);
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("payos");
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingRef = useRef(null);

  const selectedAddress = addresses.find(a => a.addressId === selectedAddressId);
  const totalItemsPrice = checkoutData?.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const finalTotal = totalItemsPrice + shippingFee;

  const formatVND = n => n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  const orderItemIds = checkoutData?.orderItems.map(i => i.id) || [];

  // Fetch wallet
  useEffect(() => {
    const loadWallet = async () => {
      const uid = localStorage.getItem("userId");
      const w = await walletApi.getWalletByUser(uid);
      setWallet(w);
    };
    loadWallet();
  }, []);
  useEffect(() => {
    const orderItemIds = checkoutData?.orderItems?.map(i => i.id) || [];

    const handleUnload = () => {
      if (orderItemIds.length > 0) {
        orderItemApi.deleteOrderItemCleanup(orderItemIds);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleUnload();
    });

    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [checkoutData]);

  // GHN shipping fee
  useEffect(() => {
    const loadShippingFee = async () => {
      if (!selectedAddress?.districtCode || !selectedAddress?.wardCode) return;
      setLoadingFee(true);
      const feeResult = await ghnApi.calcFee({
        toDistrictId: selectedAddress.districtCode,
        toWardCode: selectedAddress.wardCode,
        weight: 2000,
      });
      setShippingFee(feeResult?.error ? 0 : feeResult || 0);
      setLoadingFee(false);
    };
    loadShippingFee();
  }, [selectedAddress]);
  const handleUnload = () => {
    if (cleanupDisabled.current) return;
    orderItemApi.deleteOrderItemCleanup(orderItemIds);
  };


  const handleConfirmAndPay = async () => {
    if (!selectedAddress) {
      setStatusMessage("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    let payWindow = null;
    if (paymentMethod === "payos") payWindow = window.open("", "_blank");

    setIsProcessing(true);
    try {
      // 1️⃣ Create Order
      const orderPayload = {
        buyerId: parseInt(localStorage.getItem("userId"), 10),
        addressId: selectedAddress.addressId,
        orderItemIds: orderItemIds,
        shippingPrice: shippingFee || 0,
        createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      };
      const orderResponse = await orderApi.postOrderNew(orderPayload);

      // 2️⃣ Wallet Payment
      if (paymentMethod === "wallet") {
        if (!wallet || wallet.balance < finalTotal) {
          setIsProcessing(false);
          setStatusMessage("Số dư ví không đủ.");
          return;
        }
        await walletApi.withdrawWallet({
          userId: parseInt(localStorage.getItem("userId"), 10),
          userRole: 'Buyer',
          amount: finalTotal,
          type: "Withdraw",
          orderId: orderResponse.orderId,
          itemId: checkoutData.orderItems[0].itemId,
          description: `Thanh toán đơn hàng ${orderResponse.orderId}`,
        });

        setWallet(prev => ({ ...prev, balance: prev.balance - finalTotal }));
        navigate("/payment/success", { state: { method: "wallet", amount: finalTotal } });

        if (checkoutData.auctionId) {
          await auctionApi.buyNow(checkoutData.auctionId);
        }

      } else {
        // 3️ PayOS Payment
        const paymentPayload = {
          userId: parseInt(localStorage.getItem("userId"), 10),
          method: "PayOS",
          totalAmount: finalTotal,
          details: checkoutData.orderItems.map(i => ({
            orderId: orderResponse.orderId,
            itemId: i.itemId,
            amount: finalTotal,
          })),
        };

        const link = await paymentApi.createPaymentLink(paymentPayload);
        if (!link?.checkoutUrl) {
          payWindow.close();
          throw new Error("Không tạo được link thanh toán.");
        }

        payWindow.location.href = link.checkoutUrl;

        // Polling for window close
        pollingRef.current = setInterval(async () => {
          if (payWindow && payWindow.closed) {
            clearInterval(pollingRef.current);
            // Check payment status
            try {
              const paidOrder = await orderApi.getOrderById(orderResponse.orderId);
              if (paidOrder?.status === "Paid") {
                window.removeEventListener("beforeunload", handleUnload);
                document.hidden = false;
                navigate("/payment/success", { state: { method: "payos", amount: finalTotal } });
                if (checkoutData.auctionId) await auctionApi.buyNow(checkoutData.auctionId);
              } else {
                navigate("/payment/fail", { state: { reason: "Thanh toán không thành công.", orderId: orderResponse.orderId } });
              }
            } catch {
              navigate("/payment/fail", { state: { reason: "Không kiểm tra được trạng thái thanh toán.", orderId: orderResponse.orderId } });
            }
          }
        }, 2000);
      }

    } catch (err) {
      console.error(err);
      setStatusMessage("Không thể hoàn tất thanh toán.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!checkoutData?.orderItems?.length)
    return <div className="p-6 text-center">Không có dữ liệu.</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Địa chỉ */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-[#C99700] flex items-center gap-2"><FiMapPin /> Địa chỉ giao hàng</h2>
          {selectedAddress ? (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800">{selectedAddress.recipientName} | {selectedAddress.phone}</p>
                <p className="text-gray-600">{`${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="text-blue-500 hover:underline font-semibold ml-4">Thay đổi</button>
            </div>
          ) : <p className="text-red-500">Không có địa chỉ giao hàng nào được chọn.</p>}
        </div>

        {/* Sản phẩm */}
        <h2 className="text-lg font-semibold mb-4">Sản phẩm đặt mua</h2>
        <div className="divide-y">
          {checkoutData.orderItems.map(i => (
            <div key={i.id} className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <img src={i.image} className="w-16 h-16 rounded object-cover" alt={i.name} />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-gray-500">Số lượng: {i.quantity}</p>
                </div>
              </div>
              <div className="flex items-center space-x-12">
                <p className="w-24 text-center">{formatVND(i.price)}</p>
                <p className="w-16 text-center">{i.quantity}</p>
                <p className="w-28 text-right font-semibold">{formatVND(i.price * i.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vận chuyển */}
        <div className="flex justify-between items-center py-4 border-t">
          <p>Vận chuyển nhanh (GHN)</p>
          <p className="font-semibold">{loadingFee ? "Đang tính..." : formatVND(shippingFee)}</p>
        </div>

        {/* Phương thức thanh toán */}
        <div className="flex justify-between items-center py-4 border-t">
          <p>Phương thức thanh toán</p>
          <div className="flex gap-4">
            <button onClick={() => setPaymentMethod("payos")}
              className={`px-4 py-2 rounded-lg font-semibold border ${paymentMethod === "payos" ? "bg-[#C99700] text-white border-[#C99700]" : "bg-white border-gray-300"}`}>PayOS</button>
            <button onClick={() => setPaymentMethod("wallet")}
              className={`px-4 py-2 rounded-lg font-semibold border ${paymentMethod === "wallet" ? "bg-[#C99700] text-white border-[#C99700]" : "bg-white border-gray-300"}`}>Ví ({wallet ? formatVND(wallet.balance) : "Đang tải..."})</button>
          </div>
        </div>

        {/* Tổng cộng */}
        <div className="flex justify-between items-center border-t pt-6">
          <p className="text-lg font-semibold">Tổng cộng ({checkoutData.orderItems.length} sản phẩm):</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{formatVND(finalTotal)}</p>
        </div>

        <div className="flex flex-col items-end mt-6">
          {statusMessage && <p className="text-red-500 mb-2 font-semibold">{statusMessage}</p>}
          <button onClick={handleConfirmAndPay}
            disabled={isProcessing || !selectedAddress}
            className="px-6 py-3 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-lg shadow hover:bg-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
          </button>
        </div>
      </div>

      {isModalOpen && <AddressModal addresses={addresses} selectedId={selectedAddressId} onSelect={setSelectedAddressId} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
