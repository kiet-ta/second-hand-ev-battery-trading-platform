import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import orderApi from "../api/orderApi";

function CheckoutPage() {
    const [addInsurance, setAddInsurance] = useState(true);
    const [address, setAddress] = useState();
    const location = useLocation();
    const orderData = location.state;
    console.log(orderData)

    const insurance = { name: "Product Damage Insurance", price: 6 };
    const shipping = { name: "Express Shipping", price: 10 };

    const calculateTotal = () => {
        let total = orderData.totalAmount || 0;
        if (addInsurance) {
            total += insurance.price;
        }
        total += shipping.price;
        return total;
    };

    const finalTotalPrice = calculateTotal();
    const confirmOrder = () => {
        const order = {
            buyerId: localStorage.getItem("userId"),
            addressId: 1,
            orderItemIds: orderData.itemsToPurchase.map(order => order.id),
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0]
        }
        console.log(order)
        orderApi.postOrderNew(order)
    }
    const finalOrderPayload = {
        ...orderData,
        insuranceAdded: addInsurance,
        shippingMethod: shipping.name,
        finalAmount: finalTotalPrice,
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Products</h2>
                <div className="divide-y">
                    {orderData && orderData.itemsToPurchase.map((item) => (
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
                                <div className='flex flex-col gap-1'>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-12">
                                <p className="w-24 text-center">${item.price.toFixed(2)}</p>
                                <p className="w-16 text-center">{item.quantity}</p>
                                <p className="w-28 text-right font-semibold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Insurance Section */}
                <div className="flex items-center justify-between py-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={addInsurance}
                            onChange={() => setAddInsurance(!addInsurance)} // Toggle insurance state
                            className="accent-maincolor"
                        />
                        <div>
                            <p className="font-medium">{insurance.name}</p>
                            <p className="text-xs text-gray-500">
                                Covers unexpected accidents, spills, or damage during use.
                            </p>
                        </div>
                    </div>
                    <p className="font-semibold">${insurance.price.toFixed(2)}</p>
                </div>

                {/* Shipping and Message Section */}
                <div className="grid grid-cols-2 gap-6 py-6 border-t">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Buyer Message:
                        </label>
                        <input
                            type="text"
                            placeholder="Leave a note for the seller..."
                            className="w-full mt-2 border rounded p-2 focus:outline-maincolor"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                            Shipping Method:
                        </p>
                        <div className="flex justify-between items-center">
                            <p>{shipping.name}</p>
                            <p className="font-semibold">${shipping.price.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Estimated delivery: Oct 14 - Oct 17, 2025
                        </p>
                    </div>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-center border-t pt-6">
                    <p className="text-lg font-semibold">
                        Total ({orderData.itemsToPurchase.length} items):
                    </p>
                    <p className="text-2xl font-bold text-maincolor">
                        ${finalTotalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="flex justify-end mt-6">
                    <Link to={'/payment-success'} onClick={confirmOrder} state={finalOrderPayload}>
                        <button className="px-6 py-3 bg-maincolor text-white font-semibold rounded-lg shadow hover:opacity-90">
                            Confirm & Pay
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;

