import React from "react";
import { Link, useLocation } from "react-router-dom";

function CheckoutPage() {
    const items = [
        {
            id: 1,
            name: "Very cute Furina picture",
            type: "Pre-Order",
            variant: "Cute",
            price: 280,
            quantity: 1,
            image: "https://i.pinimg.com/736x/1d/86/08/1d86084db7913c1bb14308057738eace.jpg",
        },
        {
            id: 2,
            name: "Amane Kanata Pop up Parade Figure - Hololive",
            type: "In Stock",
            variant: "Default",
            price: 1350,
            quantity: 1,
            image: "https://i.pinimg.com/736x/25/31/5b/25315b5a3d3fa0b8d19753e4c6b2506b.jpg",
        },
    ];

    const insurance = { name: "Product Damage Insurance", price: 6 };
    const shipping = { name: "Express Shipping", price: 10 };
    const location = useLocation();
    const receivedPrice = location.state;


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Products</h2>
                <div className="divide-y">
                    {items.map((item) => (
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
                                <div className='flex gap-4'>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Variant: {item.variant}
                                    </p>
                                    <span className="text-xs px-2 py-1 rounded bg-maincolor text-white">
                                        {item.type}
                                    </span>
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

                <div className="flex items-center justify-between py-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="accent-maincolor" />
                        <div>
                            <p className="font-medium">{insurance.name}</p>
                            <p className="text-xs text-gray-500">
                                Covers unexpected accidents, spills, or damage during use.
                            </p>
                        </div>
                    </div>
                    <p className="font-semibold">${insurance.price.toFixed(2)}</p>
                </div>

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
                            Estimated delivery: Oct 4 - Oct 7, 2025
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t pt-6">
                    <p className="text-lg font-semibold">
                        Total ({items.length} items):
                    </p>
                    <p className="text-2xl font-bold text-maincolor">
                        {console.log(receivedPrice)}
                        ${receivedPrice}
                    </p>
                </div>

                <div className="flex justify-end mt-6">
                    <Link to={'/'}  state={receivedPrice}>
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
