import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../api/paymentApi";
// ✨ 1. Import your orderApi module
import orderApi from "../api/orderApi";
import orderItemApi from "../api/orderItemApi";

function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state;

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const pollingIntervalRef = useRef(null);
        const [addInsurance, setAddInsurance] = useState(true);
    const insurance = { name: "Product Damage Insurance", price: 6 };
    const shipping = { name: "Express Shipping", price: 10 };

    // This effect cleans up the polling when the user navigates away
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    if (!orderData || !orderData.itemsToPurchase || orderData.itemsToPurchase.length === 0) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen text-center">
                <p>No checkout data found. Please return to your cart.</p>
            </div>
        );
    }


    const calculateTotal = () => {
        let total = orderData.totalAmount || 0;
        if (addInsurance) { total += insurance.price; }
        total += shipping.price;
        return total;
    };

    const finalTotalPrice = calculateTotal();

    const checkPaymentStatus = async (orderCode, paymentWindow) => {
        try {
            const info = await paymentApi.getPaymentInfoByOrderCode(orderCode);
            
            if (info.status === 'PAID') {
                orderData.itemsToPurchase.map(item => orderItemApi.deleteOrderItem(item.orderItemId))
                clearInterval(pollingIntervalRef.current);
                paymentWindow.close();
                navigate('/payment/success', { state: { paymentInfo: info } });
            
            } else if (info.status === 'CANCELLED' || info.status === 'FAILED') {
                orderData.itemsToPurchase.map(item => console.log("ItemID",item.orderItemId))

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

        try {
            // ✨ 2. Create the order payload first
            const orderPayload = {
                buyerId: localStorage.getItem("userId"),
                addressId: 1, // Using a static addressId as per your example
                orderItemIds: orderData.itemsToPurchase.map(item => item.orderItemId),
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0]
            };
            
            // ✨ 3. Call the API to create the order and get the response
            const orderResponse = await orderApi.postOrderNew(orderPayload);
            console.log("Order Creation Response:", orderResponse);

            // Ensure we received a valid orderId
            if (!orderResponse || !orderResponse.orderId) {
                throw new Error("Failed to get a valid Order ID from the server.");
            }

            // ✨ 4. Create the payment payload using the orderId from the response
            setStatusMessage('Initializing payment...');
            const paymentPayload = {
                userId: orderData.buyerId,
                method: "payos",
                totalAmount: finalTotalPrice,
                details: [{
                    orderId: orderResponse.orderId, // Use the new orderId here
                    itemId: 1, // Using static itemId as requested
                    amount: finalTotalPrice
                }]
            };

            const paymentLinkResponse = await paymentApi.createPaymentLink(paymentPayload);
            // Log the response to make debugging easier
            console.log("Payment Link Creation Response:", paymentLinkResponse);

            // Destructure the properties from the response data object
            const { checkoutUrl, orderCode } = paymentLinkResponse;


            if (checkoutUrl && orderCode) {
                setStatusMessage('Awaiting payment in the popup window...');
                const paymentWindow = window.open(checkoutUrl, 'PayOS Payment', 'width=800,height=600');

                pollingIntervalRef.current = setInterval(() => {
                    if (paymentWindow && paymentWindow.closed) {
                                        orderData.itemsToPurchase.map(item => console.log("ItemID",item.orderItemId))

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
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-gray-200"><h2 className="text-lg font-semibold mb-4 text-maincolor">Delivery Address</h2><div className="flex justify-between items-start"><div className="space-y-1"><p className="font-bold text-gray-800">John Doe (+84) 123 456 789</p><p className="text-gray-600">123 Fictional Street, Imagination Ward, Dreamland District, Ho Chi Minh City</p></div><button className="text-blue-500 hover:underline font-semibold ml-4">Change</button></div></div>
                <h2 className="text-lg font-semibold mb-4">Products Ordered</h2>
                <div className="divide-y">{orderData.itemsToPurchase.map((item) => (<div key={item.id} className="flex items-center justify-between py-4"><div className="flex items-center space-x-4"><img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" /><div className='flex flex-col gap-1'><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">Quantity: {item.quantity}</p></div></div><div className="flex items-center space-x-12"><p className="w-24 text-center">${item.price.toFixed(2)}</p><p className="w-16 text-center">{item.quantity}</p><p className="w-28 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p></div></div>))}</div>
                <div className="flex items-center justify-between py-4 border-t"><div className="flex items-center space-x-2"><input type="checkbox" checked={addInsurance} onChange={() => setAddInsurance(!addInsurance)} className="accent-maincolor" /><div><p className="font-medium">{insurance.name}</p><p className="text-xs text-gray-500">Covers unexpected accidents, spills, or damage during use.</p></div></div><p className="font-semibold">${insurance.price.toFixed(2)}</p></div>
                <div className="grid grid-cols-2 gap-6 py-6 border-t"><div><label className="text-sm font-medium text-gray-600">Buyer Message:</label><input type="text" placeholder="Leave a note for the seller..." className="w-full mt-2 border rounded p-2 focus:outline-maincolor" /></div><div><p className="text-sm font-medium text-gray-600 mb-2">Shipping Method:</p><div className="flex justify-between items-center"><p>{shipping.name}</p><p className="font-semibold">${shipping.price.toFixed(2)}</p></div><p className="text-xs text-gray-500 mt-1">Estimated delivery: Oct 20 - Oct 23, 2025</p></div></div>
                <div className="flex justify-between items-center border-t pt-6"><p className="text-lg font-semibold">Total ({orderData.itemsToPurchase.length} items):</p><p className="text-2xl font-bold text-maincolor">${finalTotalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                
                <div className="flex flex-col items-end mt-6">
                    {statusMessage && <p className="text-maincolor mb-2 font-semibold">{statusMessage}</p>}
                    <button 
                        onClick={handleConfirmAndPay}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-maincolor text-white font-semibold rounded-lg shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;

