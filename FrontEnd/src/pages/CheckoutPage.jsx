import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../api/paymentApi";
import orderApi from "../api/orderApi";
import orderItemApi from "../api/orderItemApi";
import { FiMapPin, FiX } from "react-icons/fi";

const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
            <div className="bg-[#FAF8F3] rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 border border-[#C4B5A0]">
                <div className="flex justify-between items-center border-b border-[#C4B5A0] pb-3 mb-4">
                    <h3 className="text-xl font-bold text-[#2C2C2C]">Chọn địa chỉ giao hàng</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-[#B8860B]">
                        <FiX size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {addresses.length > 0 ? (
                        addresses.map((addr) => (
                            <div
                                key={addr.addressId}
                                onClick={() => onSelect(addr.addressId)}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    selectedId === addr.addressId ? 'border-[#B8860B] bg-yellow-50' : 'border-[#E8E4DC] hover:border-[#C4B5A0]'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-[#2C2C2C]">{addr.recipientName} | {addr.phone}</p>
                                        <p className="text-gray-600 text-sm mt-1">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                                    </div>
                                    {addr.isDefault && <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full">Mặc định</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Không tìm thấy địa chỉ nào.</p>
                    )}
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-lg hover:bg-[#B8860B] transition-colors">
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

    const [selectedAddressId, setSelectedAddressId] = useState(orderData?.selectedAddressId);
    const [addresses, setAddresses] = useState(orderData?.allAddresses || []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const pollingIntervalRef = useRef(null);
    
    const insurance = { name: "Bảo hiểm hư hỏng sản phẩm", price: 6000 }; 
    const shipping = { name: "Giao hàng nhanh", price: 1000 };

    const selectedDeliveryAddress = addresses.find(addr => addr.addressId === selectedAddressId);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const formatVND = (price) => {
        if (typeof price !== 'number') return '0 đ';
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    if (!orderData || !orderData.itemsToPurchase || orderData.itemsToPurchase.length === 0) {
        return (
            <div className="p-6 bg-[#FAF8F3] min-h-screen text-center">
                <p className="text-[#2C2C2C]">Không tìm thấy dữ liệu thanh toán. Vui lòng quay lại giỏ hàng.</p>
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
            
            if (info.status === 'PAID') {
                clearInterval(pollingIntervalRef.current);
                paymentWindow?.close();
                navigate('/payment/success', { state: { paymentInfo: info } });
            
            } else if (info.status === 'CANCELLED' || info.status === 'FAILED') {
                clearInterval(pollingIntervalRef.current);
                paymentWindow?.close();
                navigate('/payment/fail', { state: { reason: `Thanh toán ${info.status === 'CANCELLED' ? 'đã bị hủy' : 'thất bại'}.` } });
            }
        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái thanh toán:", error);
            clearInterval(pollingIntervalRef.current);
            setIsProcessing(false);
            setStatusMessage('Không thể xác minh trạng thái thanh toán.');
        }
    };

    const handleConfirmAndPay = async () => {
        setIsProcessing(true);
        setStatusMessage('Đang xác nhận đơn hàng...');

        if (!selectedDeliveryAddress) {
             setStatusMessage('Vui lòng chọn địa chỉ giao hàng.');
             setIsProcessing(false);
             return;
        }

        try {
            const orderPayload = {
                buyerId: localStorage.getItem("userId"),
                addressId: selectedDeliveryAddress.addressId, 
                orderItemIds: orderData.itemsToPurchase.flatMap(item => item.orderItemIdsToDelete),
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0]
            };
            
            const orderResponse = await orderApi.postOrderNew(orderPayload);
            console.log("Phản hồi tạo đơn hàng:", orderResponse);

            if (!orderResponse || !orderResponse.orderId) {
                throw new Error("Không nhận được ID đơn hàng hợp lệ từ máy chủ.");
            }

            setStatusMessage('Đang khởi tạo thanh toán...');
            const paymentPayload = {
                userId: orderData.buyerId,
                method: "payos",
                totalAmount: finalTotalPrice,
                details: [{
                    orderId: orderResponse.orderId, 
                    itemId: 1, 
                    amount: finalTotalPrice
                }]
            };

            const paymentLinkResponse = await paymentApi.createPaymentLink(paymentPayload);
            console.log("Phản hồi tạo liên kết thanh toán:", paymentLinkResponse);

            const { checkoutUrl, orderCode } = paymentLinkResponse;


            if (checkoutUrl && orderCode) {
                setStatusMessage('Đang chờ thanh toán trong cửa sổ bật lên...');
                const paymentWindow = window.open(checkoutUrl, 'PayOS Payment', 'width=800,height=600');

                pollingIntervalRef.current = setInterval(() => {
                    if (paymentWindow && paymentWindow.closed) {
                        clearInterval(pollingIntervalRef.current);
                        setIsProcessing(false);
                        setStatusMessage('Người dùng đã hủy thanh toán.');
                        paymentApi.cancelPayment(orderCode, "Người dùng đã đóng cửa sổ thanh toán.")
                            .then(() => {
                                navigate('/payment/fail', { state: { reason: "Bạn đã đóng cửa sổ thanh toán." } });
                            });
                        return;
                    }
                    if (paymentWindow) { // Only check if window is still open
                        checkPaymentStatus(orderCode, paymentWindow);
                    } else { // Window could not be opened
                        clearInterval(pollingIntervalRef.current);
                        setIsProcessing(false);
                        setStatusMessage('Không thể mở cửa sổ thanh toán. Vui lòng kiểm tra cài đặt trình chặn cửa sổ bật lên.');
                    }
                }, 3000);
            } else {
                 throw new Error("Không nhận được URL thanh toán hoặc mã đơn hàng.");
            }
        } catch (error) {
            console.error("Thất bại trong quá trình tạo đơn hàng hoặc thanh toán:", error);
            setIsProcessing(false);
            setStatusMessage('Không thể xử lý đơn hàng của bạn.');
            navigate('/payment/fail', { state: { reason: "Không thể hoàn tất đơn hàng của bạn. Vui lòng thử lại." } });
        }
    };

    return (
        <div className="p-6 bg-[#FAF8F3] min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 border border-[#E8E4DC]">
                
                <div className="mb-6 pb-4 border-b border-[#E8E4DC]">
                    <h2 className="text-xl font-bold mb-4 text-[#B8860B] flex items-center gap-2"><FiMapPin /> Địa chỉ giao hàng</h2>
                    {selectedDeliveryAddress ? (
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="font-bold text-[#2C2C2C]">
                                    {selectedDeliveryAddress.recipientName} | {selectedDeliveryAddress.phone}
                                </p>
                                <p className="text-gray-600">
                                    {`${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.ward}, ${selectedDeliveryAddress.district}, ${selectedDeliveryAddress.province}`}
                                </p>
                                {selectedDeliveryAddress.isDefault && <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full mt-1 inline-block">Mặc định</span>}
                            </div>
                            <button 
                                className="text-[#B8860B] hover:text-[#D4AF37] font-semibold ml-4 underline transition-colors"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Thay đổi
                            </button>
                        </div>
                    ) : (
                        <p className="text-red-500">Chưa chọn hoặc không tìm thấy địa chỉ giao hàng.</p>
                    )}
                </div>
                
                <h2 className="text-xl font-bold mb-4 text-[#2C2C2C]">Sản phẩm đã đặt</h2>
                <div className="divide-y divide-[#E8E4DC]">
                    {orderData.itemsToPurchase.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover border border-[#E8E4DC]" />
                                <div className='flex flex-col gap-1'>
                                    <p className="font-medium text-[#2C2C2C]">{item.name}</p>
                                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-12 text-[#2C2C2C]">
                                <p className="w-24 text-center">{formatVND(item.price)}</p>
                                <p className="w-16 text-center">{item.quantity}</p>
                                <p className="w-28 text-right font-semibold">{formatVND(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between py-4 border-t border-[#E8E4DC] mt-4">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={true} readOnly className="accent-[#D4AF37]" />
                        <div>
                            <p className="font-medium text-[#2C2C2C]">{insurance.name}</p>
                            <p className="text-xs text-gray-500">Bao gồm tai nạn, đổ vỡ hoặc hư hỏng không mong muốn trong quá trình sử dụng.</p>
                        </div>
                    </div>
                    <p className="font-semibold text-[#2C2C2C]">{formatVND(insurance.price)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-[#E8E4DC]">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Lời nhắn cho người bán:</label>
                        <input type="text" placeholder="Để lại lời nhắn..." className="w-full mt-2 border border-[#E8E4DC] rounded p-2 focus:outline-[#D4AF37] text-[#2C2C2C] bg-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Phương thức vận chuyển:</p>
                        <div className="flex justify-between items-center text-[#2C2C2C]">
                            <p>{shipping.name}</p>
                            <p className="font-semibold">{formatVND(shipping.price)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Dự kiến giao hàng: 3-5 ngày làm việc</p>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t border-[#E8E4DC] pt-6 mt-4">
                    <p className="text-lg font-semibold text-[#2C2C2C]">Tổng cộng ({orderData.itemsToPurchase.length} sản phẩm):</p>
                    <p className="text-2xl font-bold text-[#B8860B]">
                        {formatVND(finalTotalPrice)}
                    </p>
                </div>
                
                <div className="flex flex-col items-end mt-6">
                    {statusMessage && <p className="text-[#B8860B] mb-2 font-semibold">{statusMessage}</p>}
                    <button 
                        onClick={handleConfirmAndPay}
                        disabled={isProcessing || !selectedDeliveryAddress}
                        className="px-8 py-3 bg-[#D4AF37] text-[#2C2C2C] font-bold text-lg rounded-lg shadow-md hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
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

export default CheckoutPage;