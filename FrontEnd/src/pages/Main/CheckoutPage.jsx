import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import addressApi from "../../hooks/services/addressApi"; // ✅ API thật
import { ghnApi } from "../../hooks/services/ghnApi";
import { FiMapPin, FiX } from "react-icons/fi";

// 🌟 Modal chọn địa chỉ giao hàng
const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Chọn địa chỉ giao hàng</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
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
                        <p className="text-gray-500 text-center py-6">
                            Không tìm thấy địa chỉ nào.
                        </p>
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

function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state;

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const pollingIntervalRef = useRef(null);

    const insurance = { name: "Bảo hiểm hư hỏng sản phẩm", price: 6000 };
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingFee, setLoadingFee] = useState(false);

    const selectedDeliveryAddress = addresses.find(
        (addr) => addr.addressId === selectedAddressId
    );

    // 🧭 Lấy danh sách địa chỉ từ API thật
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const res = await addressApi.getUserAddresses(userId);
                if (res && Array.isArray(res)) {
                    setAddresses(res);
                    const defaultAddr = res.find((a) => a.isDefault);
                    if (defaultAddr) setSelectedAddressId(defaultAddr.addressId);
                    else if (res.length > 0) setSelectedAddressId(res[0].addressId);
                }
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách địa chỉ:", err);
            }
        };

        fetchAddresses();
    }, []);

    // 🧮 Tự động tính phí GHN mỗi khi địa chỉ đổi
    useEffect(() => {
        const fetchShippingFee = async () => {
            if (!selectedDeliveryAddress?.districtCode || !selectedDeliveryAddress?.wardCode)
                return;

            try {
                setLoadingFee(true);
                const feeResult = await ghnApi.calcFee({
                    toDistrictId: selectedDeliveryAddress.districtCode,
                    toWardCode: selectedDeliveryAddress.wardCode,
                    weight: 2000,
                });

                // ✅ Nếu GHN trả lỗi có message → hiển thị rõ ràng
                if (feeResult.error) {
                    setShippingFee(0);
                    alert(feeResult.message || "GHN hiện chưa hỗ trợ khu vực này.");
                    return;
                }

                // ✅ Còn nếu trả về số → cập nhật bình thường
                setShippingFee(feeResult || 0);
            } catch (err) {
                console.error("❌ Không tính được phí GHN:", err);
                setShippingFee(0);
            } finally {
                setLoadingFee(false);
            }
        };

        fetchShippingFee();
    }, [selectedDeliveryAddress]);


    const formatVND = (price) =>
        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    const calculateTotal = () => {
        let total = orderData.totalAmount || 0;
        total += insurance.price;
        total += shippingFee;
        return total;
    };
    const finalTotalPrice = calculateTotal();

    // 💳 Thanh toán
    const handleConfirmAndPay = async () => {
        setIsProcessing(true);
        setStatusMessage("Đang xác nhận đơn hàng...");

        if (!selectedDeliveryAddress) {
            setStatusMessage("Vui lòng chọn địa chỉ giao hàng.");
            setIsProcessing(false);
            return;
        }

        try {
            const orderPayload = {
                buyerId: localStorage.getItem("userId"),
                addressId: selectedDeliveryAddress.addressId,
                orderItemIds: orderData.itemsToPurchase.flatMap(
                    (item) => item.orderItemIdsToDelete
                ),
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0],
            };

            const orderResponse = await orderApi.postOrderNew(orderPayload);
            if (!orderResponse?.orderId) throw new Error("Không tạo được đơn hàng.");

            const paymentPayload = {
                userId: orderData.buyerId,
                method: "payos",
                totalAmount: finalTotalPrice,
                details: [
                    {
                        orderId: orderResponse.orderId,
                        itemId: 1,
                        amount: finalTotalPrice,
                    },
                ],
            };

            const paymentLinkResponse = await paymentApi.createPaymentLink(paymentPayload);
            const { checkoutUrl, orderCode } = paymentLinkResponse;
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
                    setStatusMessage("Thanh toán đã bị hủy bởi người dùng.");
                    navigate("/payment/fail", {
                        state: { reason: "Bạn đã đóng cửa sổ thanh toán." },
                    });
                    return;
                }
            }, 3000);
        } catch (error) {
            console.error("❌ Lỗi thanh toán:", error);
            setIsProcessing(false);
            navigate("/payment/fail", {
                state: { reason: "Không thể hoàn tất đơn hàng. Vui lòng thử lại." },
            });
        }
    };

    if (!orderData?.itemsToPurchase?.length) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen text-center">
                <p>Không tìm thấy dữ liệu thanh toán. Vui lòng quay lại giỏ hàng.</p>
            </div>
        );
    }

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
                                    {selectedDeliveryAddress.recipientName} |{" "}
                                    {selectedDeliveryAddress.phone}
                                </p>
                                <p className="text-gray-600">
                                    {`${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.ward}, ${selectedDeliveryAddress.district}, ${selectedDeliveryAddress.province}`}
                                </p>
                                {selectedDeliveryAddress.isDefault && (
                                    <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full mt-1 inline-block">
                                        Mặc định
                                    </span>
                                )}
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

                {/* 🛒 Danh sách sản phẩm */}
                <h2 className="text-lg font-semibold mb-4">Sản phẩm đặt mua</h2>
                <div className="divide-y">
                    {orderData.itemsToPurchase.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 rounded object-cover"
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Số lượng: {item.quantity}
                                    </p>
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

                {/* Bảo hiểm & Vận chuyển */}
                <div className="flex items-center justify-between py-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={true} readOnly className="accent-maincolor" />
                        <div>
                            <p className="font-medium">{insurance.name}</p>
                            <p className="text-xs text-gray-500">
                                Bảo vệ sản phẩm khỏi rủi ro, va đập, hoặc hư hỏng trong quá trình vận chuyển.
                            </p>
                        </div>
                    </div>
                    <p className="font-semibold">{formatVND(insurance.price)}</p>
                </div>

                {/* Phí ship */}
                <div className="flex justify-between items-center py-4 border-t">
                    <p>Vận chuyển nhanh (GHN)</p>
                    <p className="font-semibold">
                        {loadingFee ? "Đang tính..." : formatVND(shippingFee || 0)}
                    </p>
                </div>

                {/* Tổng thanh toán */}
                <div className="flex justify-between items-center border-t pt-6">
                    <p className="text-lg font-semibold">
                        Tổng cộng ({orderData.itemsToPurchase.length} sản phẩm):
                    </p>
                    <p className="text-2xl font-bold text-[#D4AF37]">{formatVND(finalTotalPrice)}</p>
                </div>

                {/* Nút xác nhận */}
                <div className="flex flex-col items-end mt-6">
                    {statusMessage && (
                        <p className="text-maincolor mb-2 font-semibold">{statusMessage}</p>
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

            {/* Modal chọn địa chỉ */}
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

export default CheckoutPage;
