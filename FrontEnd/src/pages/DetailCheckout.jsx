import React, { useState } from 'react';
import { MapPin, Store, MessageSquare, Ticket, CreditCard, Building2, Wallet, DollarSign } from 'lucide-react';

export default function DetailedCheckoutPage() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            shopName: 'Xe Ý Ông Hùng 1Ơi Shopee',
            shopBadge: 'Mall',
            chatNow: true,
            products: [
                {
                    id: 'p1',
                    name: 'Ô tô Điện Apple iPhone 17 Pro Max 512GB',
                    variant: 'Variation: Xuân Diễm',
                    price: 46490000,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=100&fit=crop'
                }
            ],
            voucher: '873.999đ',
            shippingInsurance: true,
            insuranceNote: 'Bảo hiểm Thiết bị di động: Bảo hiểm sửa chữa cho trái tính của thiết bị chỉ mất toàn màn hình sửa nhanh đến nhà với'
        },
        {
            id: 2,
            shopName: 'Apple Flagship Store',
            shopBadge: 'Mall',
            chatNow: true,
            products: [
                {
                    id: 'p2',
                    name: 'Pin Lithium 60kWh Tesla Compatible',
                    variant: 'Variation: Standard',
                    price: 120000000,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=100&h=100&fit=crop'
                }
            ],
            voucher: null,
            shippingInsurance: false
        }
    ]);

    const [deliveryInfo, setDeliveryInfo] = useState({
        name: 'Thanh Trung',
        phone: '(+84) 797 338 518',
        address: 'Tầng Nhà 51 31, Đường Nguyễn Xiển, Khu Đô Thị Vinhomes Grand Park, Phường Long Thạnh Mỹ, Thành Phố Thủ Đức, TP. Hồ Chí Minh'
    });

    const [paymentMethod, setPaymentMethod] = useState('shopee_pay');
    const [messageToSeller, setMessageToSeller] = useState('');
    const [vouchers, setVouchers] = useState({
        shop: null,
        platform: null
    });

    const [shippingOption, setShippingOption] = useState('nhanh');
    const [coinsUsed, setCoinsUsed] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    const calculateMerchandiseSubtotal = () => {
        return cartItems.reduce((total, shop) => {
            return total + shop.products.reduce((shopTotal, product) => {
                return shopTotal + (product.price * product.quantity);
            }, 0);
        }, 0);
    };

    const merchandiseSubtotal = calculateMerchandiseSubtotal();
    const productProtection = 873999;
    const shippingSubtotal = 12000;
    const orderTotal = merchandiseSubtotal + productProtection + shippingSubtotal;

    const handlePlaceOrder = () => {
        alert(`Đặt hàng thành công!\nTổng tiền: ${formatPrice(orderTotal)}\nPhương thức: ${paymentMethod}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <h1 className="text-2xl">Checkout</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Delivery Address */}
                <div className="bg-white rounded p-6 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-orange-500">Delivery Address</h2>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex gap-4 mb-2">
                                <span className="font-semibold">{deliveryInfo.name}</span>
                                <span className="text-gray-600">{deliveryInfo.phone}</span>
                            </div>
                            <p className="text-gray-600">{deliveryInfo.address}</p>
                        </div>
                        <button className="text-blue-500 border border-blue-500 px-4 py-1 rounded hover:bg-blue-50">
                            Change
                        </button>
                    </div>
                </div>

                {/* Products Ordered */}
                <div className="bg-white rounded shadow-sm mb-4">
                    <div className="px-6 py-4 border-b bg-orange-50">
                        <div className="grid grid-cols-12 gap-4 text-sm text-gray-600">
                            <div className="col-span-5">Products Ordered</div>
                            <div className="col-span-2 text-center">Unit Price</div>
                            <div className="col-span-2 text-center">Amount</div>
                            <div className="col-span-2 text-center">Item Subtotal</div>
                        </div>
                    </div>

                    {cartItems.map((shop) => (
                        <div key={shop.id} className="border-b last:border-b-0">
                            {/* Shop Header */}
                            <div className="px-6 py-3 bg-gray-50 flex items-center gap-3">
                                <Store className="w-4 h-4" />
                                <span className="font-medium">{shop.shopName}</span>
                                {shop.shopBadge && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                                        {shop.shopBadge}
                                    </span>
                                )}
                                {shop.chatNow && (
                                    <button className="ml-auto text-blue-500 text-sm flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        Chat now
                                    </button>
                                )}
                            </div>

                            {/* Products */}
                            {shop.products.map((product) => (
                                <div key={product.id} className="px-6 py-4">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-5 flex gap-3">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                            <div>
                                                <h3 className="font-medium mb-1">{product.name}</h3>
                                                <p className="text-sm text-gray-500">{product.variant}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center text-gray-600">
                                            {formatPrice(product.price)}
                                        </div>
                                        <div className="col-span-2 text-center">{product.quantity}</div>
                                        <div className="col-span-2 text-center font-medium">
                                            {formatPrice(product.price * product.quantity)}
                                        </div>
                                    </div>
                                </div>
                            ))}



                            {/* E-Invoice & Voucher Section */}
                            <div className="px-6 py-4 space-y-3">

                                <div className="flex items-center justify-between text-sm pt-2 border-t">
                                    <div>
                                        <span className="text-gray-600 mr-2">Shipping Option:</span>
                                        <span className="font-medium">Nhanh</span>
                                        <button className="text-blue-500 ml-2">Change</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Section */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-4">

                        {/* Payment Method */}
                        <div className="bg-white rounded p-6 shadow-sm">
                            <h3 className="font-medium mb-4">Payment Method</h3>
                            <div className="space-y-2">

                                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="credit_card"
                                        checked={paymentMethod === 'credit_card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <CreditCard className="w-5 h-5" />
                                    <span>Credit / Debit Card</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank_transfer"
                                        checked={paymentMethod === 'bank_transfer'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <Building2 className="w-5 h-5" />
                                    <span>Bank Transfer</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <Wallet className="w-5 h-5" />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded p-6 shadow-sm h-fit sticky top-24">
                        <div className="space-y-3 pb-4 border-b">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Merchandise Subtotal:</span>
                                <span>{formatPrice(merchandiseSubtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Product Protection Subtotal:</span>
                                <span>{formatPrice(productProtection)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping Subtotal:</span>
                                <span>{formatPrice(shippingSubtotal)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-semibold py-4 border-b">
                            <span>Order Total (1 item):</span>
                            <span className="text-orange-500">{formatPrice(orderTotal)}</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className="w-full bg-orange-500 text-white py-3 rounded mt-4 font-medium hover:bg-orange-600 transition"
                        >
                            Place Order
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By clicking on "Place Order", I agree to follow Shopee's policies
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}