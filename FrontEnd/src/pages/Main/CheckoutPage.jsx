import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import { FiMapPin, FiX } from "react-icons/fi";

// Helper component for the Address Selection Modal
const AddressModal = ({ addresses, selectedId, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold">Select Delivery Address</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
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
                                    selectedId === addr.addressId ? 'border-maincolor bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{addr.recipientName} | {addr.phone}</p>
                                        <p className="text-gray-600 text-sm mt-1">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                                    </div>
                                    {addr.isDefault && <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full">Default</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No addresses found.</p>
                    )}
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-maincolor text-white rounded-lg hover:opacity-90">
                        Close
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

    // Use state to manage the selected address so it can be changed in the modal
    const [selectedAddressId, setSelectedAddressId] = useState(orderData?.selectedAddressId);
    const [addresses, setAddresses] = useState(orderData?.allAddresses || []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const pollingIntervalRef = useRef(null);
    
    // Using a base rate for example. Assuming VND uses these amounts.
    const insurance = { name: "Product Damage Insurance", price: 6000 }; 
    const shipping = { name: "Express Shipping", price: 1000 };

    // Find the currently selected address object
    const selectedDeliveryAddress = addresses.find(addr => addr.addressId === selectedAddressId);


    // This effect cleans up the polling when the user navigates away
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Function to format price to VND
    const formatVND = (price) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    if (!orderData || !orderData.itemsToPurchase || orderData.itemsToPurchase.length === 0) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen text-center">
                <p>No checkout data found. Please return to your cart.</p>
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
                paymentWindow.close();
                navigate('/payment/success', { state: { paymentInfo: info } });
            
            } else if (info.status === 'CANCELLED' || info.status === 'FAILED') {
                clearInterval(pollingIntervalRef.current);
                paymentWindow.close();
                navigate('/payment/fail', { state: { reason: `Payment was ${info.status.toLowerCase()}.` } });
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
            clearInterval(pollingIntervalRef.current);
            setIsProcessing(false);
            setStatusMessage('Could not verify payment status.');
        }
    };

    const handleConfirmAndPay = async () => {
        setIsProcessing(true);
        setStatusMessage('Confirming your order...');

        if (!selectedDeliveryAddress) {
             setStatusMessage('Please select a delivery address.');
             setIsProcessing(false);
             return;
        }

        try {
            // 2. Create the order payload first
            const orderPayload = {
                buyerId: localStorage.getItem("userId"),
                // USING THE CURRENTLY SELECTED addressId from state
                addressId: selectedDeliveryAddress.addressId, 
                orderItemIds: orderData.itemsToPurchase.flatMap(item => item.orderItemIdsToDelete),
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0]
            };
            
            const orderResponse = await orderApi.postOrderNew(orderPayload);
            console.log("Order Creation Response:", orderResponse);

            if (!orderResponse || !orderResponse.orderId) {
                throw new Error("Failed to get a valid Order ID from the server.");
            }

            // 4. Create the payment payload using the orderId from the response
            setStatusMessage('Initializing payment...');
            const paymentPayload = {
                userId: orderData.buyerId,
                method: "payos",
                totalAmount: finalTotalPrice,
                details: [{
                    orderId: orderResponse.orderId, 
                    itemId: 1, // Using static itemId as requested
                    amount: finalTotalPrice
                }]
            };

            const paymentLinkResponse = await paymentApi.createPaymentLink(paymentPayload);
            console.log("Payment Link Creation Response:", paymentLinkResponse);

            const { checkoutUrl, orderCode } = paymentLinkResponse;


            if (checkoutUrl && orderCode) {
                setStatusMessage('Awaiting payment in the popup window...');
                const paymentWindow = window.open(checkoutUrl, 'PayOS Payment', 'width=800,height=600');

                pollingIntervalRef.current = setInterval(() => {
                    if (paymentWindow && paymentWindow.closed) {
                        clearInterval(pollingIntervalRef.current);
                        setIsProcessing(false);
                        setStatusMessage('Payment cancelled by user.');
                        paymentApi.cancelPayment(orderCode, "User closed the payment window.")
                            .then(() => {
                                navigate('/payment/fail', { state: { reason: "You closed the payment window." } });
                            });
                        return;
                    }
                    checkPaymentStatus(orderCode, paymentWindow);
                }, 3000);
            }
        } catch (error) {
            console.error("Failed during order or payment creation:", error);
            setIsProcessing(false);
            setStatusMessage('Failed to process your order.');
            navigate('/payment/fail', { state: { reason: "Could not finalize your order. Please try again." } });
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                
                {/* Delivery Address Section */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 text-maincolor flex items-center gap-2"><FiMapPin /> Delivery Address</h2>
                    {selectedDeliveryAddress ? (
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-800">
                                    {selectedDeliveryAddress.recipientName} | {selectedDeliveryAddress.phone}
                                </p>
                                <p className="text-gray-600">
                                    {`${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.ward}, ${selectedDeliveryAddress.district}, ${selectedDeliveryAddress.province}`}
                                </p>
                                {selectedDeliveryAddress.isDefault && <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full mt-1 inline-block">Default</span>}
                            </div>
                            {/* Button to open the modal */}
                            <button 
                                className="text-blue-500 hover:underline font-semibold ml-4"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <p className="text-red-500">No delivery address selected or found.</p>
                    )}
                </div>
                
                {/* Products Ordered Section */}
                <h2 className="text-lg font-semibold mb-4">Products Ordered</h2>
                <div className="divide-y">
                    {orderData.itemsToPurchase.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                                <div className='flex flex-col gap-1'>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-12">
                                <p className="w-24 text-center">{formatVND(item.price)}</p>
                                <p className="w-16 text-center">{item.quantity}</p>
                                <p className="w-28 text-right font-semibold">{formatVND(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Insurance and Shipping */}
                <div className="flex items-center justify-between py-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={true} className="accent-maincolor" />
                        <div>
                            <p className="font-medium">{insurance.name}</p>
                            <p className="text-xs text-gray-500">Covers unexpected accidents, spills, or damage during use.</p>
                        </div>
                    </div>
                    <p className="font-semibold">{formatVND(insurance.price)}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 py-6 border-t">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Buyer Message:</label>
                        <input type="text" placeholder="Leave a note for the seller..." className="w-full mt-2 border rounded p-2 focus:outline-maincolor" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Shipping Method:</p>
                        <div className="flex justify-between items-center">
                            <p>{shipping.name}</p>
                            <p className="font-semibold">{formatVND(shipping.price)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Estimated delivery: 3-5 Business Days</p>
                    </div>
                </div>

                {/* Total Price & Payment Button */}
                <div className="flex justify-between items-center border-t pt-6">
                    <p className="text-lg font-semibold">Total ({orderData.itemsToPurchase.length} items):</p>
                    <p className="text-2xl font-bold text-maincolor">
                        {formatVND(finalTotalPrice)}
                    </p>
                </div>
                
                <div className="flex flex-col items-end mt-6">
                    {statusMessage && <p className="text-maincolor mb-2 font-semibold">{statusMessage}</p>}
                    <button 
                        onClick={handleConfirmAndPay}
                        disabled={isProcessing || !selectedDeliveryAddress}
                        className="px-6 py-3 bg-maincolor text-white font-semibold rounded-lg shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>

            {/* Address Selection Modal */}
            {isModalOpen && (
                <AddressModal
                    addresses={addresses}
                    selectedId={selectedAddressId}
                    onSelect={(id) => {
                        setSelectedAddressId(id);
                        setIsModalOpen(false); // Close modal on selection
                    }}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

export default CheckoutPage;