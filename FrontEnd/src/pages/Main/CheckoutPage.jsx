import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import { FiMapPin, FiX } from "react-icons/fi";

const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        Chọn địa chỉ giao hàng
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FiX size={22} className="text-gray-600 hover:text-gray-800" />
                    </button>
                </div>

                {/* Danh sách địa chỉ */}
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

                {/* Footer */}
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

    const [selectedAddressId, setSelectedAddressId] = useState(
        orderData?.selectedAddressId
    );
    const [addresses, setAddresses] = useState(orderData?.allAddresses || []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const pollingIntervalRef = useRef(null);

    const insurance = { name: "Bảo hiểm hư hỏng sản phẩm", price: 6000 };
    const shipping = { name: "Vận chuyển nhanh", price: 1000 };

    const selectedDeliveryAddress = addresses.find(
        (addr) => addr.addressId === selectedAddressId
    );

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const formatVND = (price) => {
        return price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    if (
        !orderData ||
        !orderData.itemsToPurchase ||
        orderData.itemsToPurchase.length === 0
    ) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen text-center">
                <p>Không tìm thấy dữ liệu thanh toán. Vui lòng quay lại giỏ hàng.</p>
            </div>
        );
    }

    const calculateTotal = () => {
        let total = orderData.totalAmount || 0;
        total += insurance.price;
        total += shipping.price;
        return total;
    };

    const finalTotalPrice = calculateTotal();

    const checkPaymentStatus = async (orderCode, paymentWindow) => {
        try {
            const info = await paymentApi.getPaymentInfoByOrderCode(orderCode);

            if (info.status === "PAID") {
                clearInterval(pollingIntervalRef.current);
                paymentWindow.close();
                navigate("/payment/success", { state: { paymentInfo: info } });
            } else if (info.status === "CANCELLED" || info.status === "FAILED") {
                clearInterval(pollingIntervalRef.current);
                paymentWindow.close();
                navigate("/payment/fail", {
                    state: { reason: `Thanh toán ${info.status.toLowerCase()}.` },
                });
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
            clearInterval(pollingIntervalRef.current);
            setIsProcessing(false);
            setStatusMessage("Không thể xác minh trạng thái thanh toán.");
        }
    };

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
            console.log("Dữ liệu tạo đơn hàng:", orderPayload);

            const orderResponse = await orderApi.postOrderNew(orderPayload);
            console.log("Kết quả tạo đơn hàng:", orderResponse);

            if (!orderResponse || !orderResponse.orderId) {
                throw new Error("Không lấy được ID đơn hàng từ máy chủ.");
            }

            setStatusMessage("Đang khởi tạo thanh toán...");
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

            const paymentLinkResponse = await paymentApi.createPaymentLink(
                paymentPayload
            );
            console.log(paymentLinkResponse, paymentPayload)
            console.log("Kết quả tạo link thanh toán:", paymentLinkResponse);

            const { checkoutUrl, orderCode } = paymentLinkResponse;

            if (checkoutUrl && orderCode) {
                setStatusMessage("Vui lòng hoàn tất thanh toán trong cửa sổ mới...");

                // Prevent multiple popups
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

                const paymentWindow = window.open(
                    checkoutUrl,
                    "Thanh toán PayOS",
                    "width=800,height=600"
                );

                if (!paymentWindow) {
                    setStatusMessage("Không thể mở cửa sổ thanh toán. Hãy kiểm tra trình chặn popup.");
                    setIsProcessing(false);
                    return;
                }

                // Poll payment status every 3s
                let attempts = 0;
                pollingIntervalRef.current = setInterval(async () => {
                    attempts++;

                    if (paymentWindow.closed) {
                        clearInterval(pollingIntervalRef.current);
                        setIsProcessing(false);
                        setStatusMessage("Bạn đã đóng cửa sổ thanh toán.");
                        navigate("/payment/fail", {
                            state: { reason: "Bạn đã hủy thanh toán bằng cách đóng cửa sổ." },
                        });
                        return;
                    }

                    try {
                        const info = await paymentApi.getPaymentInfoByOrderCode(orderCode);
                        if (info.status === "PAID") {
                            clearInterval(pollingIntervalRef.current);
                            paymentWindow.close();
                            navigate("/payment/success", { state: { paymentInfo: info } });
                        } else if (["FAILED", "CANCELLED"].includes(info.status)) {
                            clearInterval(pollingIntervalRef.current);
                            paymentWindow.close();
                            navigate("/payment/fail", {
                                state: { reason: `Thanh toán ${info.status.toLowerCase()}.` },
                            });
                        }
                    } catch (err) {
                        console.error("Payment status polling error:", err);
                    }

                    // Auto-stop after 3 minutes
                    if (attempts > 60) {
                        clearInterval(pollingIntervalRef.current);
                        paymentWindow.close();
                        setIsProcessing(false);
                        navigate("/payment/fail", {
                            state: { reason: "Thanh toán quá thời gian cho phép (timeout)." },
                        });
                    }
                }, 3000);
            }
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng hoặc thanh toán:", error);
            setIsProcessing(false);
            setStatusMessage("Xử lý đơn hàng thất bại.");
            navigate("/payment/fail", {
                state: { reason: "Không thể hoàn tất đơn hàng. Vui lòng thử lại." },
            });
        }
    };

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
                        <p className="text-red-500">
                            Không có địa chỉ giao hàng nào được chọn.
                        </p>
                    )}
                </div>

                {/* Sản phẩm đặt hàng */}
                <h2 className="text-lg font-semibold mb-4">Sản phẩm đặt mua</h2>
                <div className="divide-y">
                    {orderData.itemsToPurchase.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between py-4"
                        >
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
                        <input type="checkbox" checked={true} className="accent-maincolor" />
                        <div>
                            <p className="font-medium">{insurance.name}</p>
                            <p className="text-xs text-gray-500">
                                Bảo vệ sản phẩm khỏi rủi ro, va đập, hoặc hư hỏng trong quá
                                trình vận chuyển.
                            </p>
                        </div>
                    </div>
                    <p className="font-semibold">{formatVND(insurance.price)}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-t">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Ghi chú cho người bán:
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập ghi chú cho người bán..."
                            className="w-full mt-2 border rounded p-2 focus:outline-maincolor"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                            Phương thức vận chuyển:
                        </p>
                        <div className="flex justify-between items-center">
                            <p>{shipping.name}</p>
                            <p className="font-semibold">{formatVND(shipping.price)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Thời gian giao hàng dự kiến: 3–5 ngày làm việc
                        </p>
                    </div>
                </div>

                {/* Tổng thanh toán */}
                <div className="flex justify-between items-center border-t pt-6">
                    <p className="text-lg font-semibold">
                        Tổng cộng ({orderData.itemsToPurchase.length} sản phẩm):
                    </p>
                    <p className="text-2xl font-bold">{formatVND(finalTotalPrice)}</p>
                </div>

                <div className="flex flex-col items-end mt-6">
                    {statusMessage && (
                        <p className="text-maincolor mb-2 font-semibold">
                            {statusMessage}
                        </p>
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