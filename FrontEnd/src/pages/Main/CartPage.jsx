import React, { useEffect, useState, useMemo } from "react";
import CardCart from "../../components/Cards/CardCart";
import { Link, useLocation } from "react-router-dom";
import orderItemApi from "../../api/orderItemApi";
import itemApi from "../../api/itemApi";
import addressApi from "../../api/addressLocalApi";
import { message, Spin } from "antd";
import { FiMapPin } from "react-icons/fi";

function CartPage() {
    const location = useLocation();

    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedItemIds, setSelectedItemIds] = useState([]);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatVND = (price) => {
        if (typeof price !== 'number') return '0 đ';
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const fetchCartAndAddressData = async () => {
        setIsLoading(true);
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setIsLoading(false);
                return;
            }

            const [orderItemsResponse, addressesResponse] = await Promise.all([
                orderItemApi.getOrderItem(userId),
                addressApi.getAddressByUserId(userId)
            ]);

            let combinedCartData = [];
            if (orderItemsResponse && orderItemsResponse.length > 0) {
                const aggregatedItemsMap = new Map();

                orderItemsResponse.forEach((item) => {
                    const existingItem = aggregatedItemsMap.get(item.itemId);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                        existingItem.orderItemIdsToDelete.push(item.orderItemId);
                    } else {
                        aggregatedItemsMap.set(item.itemId, {
                            ...item,
                            orderItemIdsToDelete: [item.orderItemId]
                        });
                    }
                });

                const uniqueOrderItems = Array.from(aggregatedItemsMap.values());
                const itemDetailPromises = uniqueOrderItems.map((item) =>
                    // Fetch full item detail to get itemType and images
                    itemApi.getItemById(item.itemId)
                );
                const itemDetails = await Promise.all(itemDetailPromises);

                let stockIssueDetected = false;

                combinedCartData = uniqueOrderItems
                    .map((orderItem) => {
                        const detail = itemDetails.find((d) => d.itemId === orderItem.itemId);
                        if (!detail) return null;

                        let finalQuantity = orderItem.quantity;
                        if (orderItem.quantity > detail.quantity) {
                            finalQuantity = detail.quantity;
                            stockIssueDetected = true;
                        }

                        return {
                            id: orderItem.itemId,
                            store: "Cửa hàng EV & Pin",
                            name: detail.title,
                            price: detail.price,
                            quantity: finalQuantity,
                            stock: detail.quantity,
                            images: detail.images || [],
                            itemType: detail.itemType,
                            orderItemIdsToDelete: orderItem.orderItemIdsToDelete
                        };
                    }).filter(Boolean);

                setCartItems(combinedCartData);

            } else {
                setCartItems([]);
            }

            if (addressesResponse && addressesResponse.length > 0) {
                setAddresses(addressesResponse);
                const defaultAddress = addressesResponse.find(addr => addr.isDefault) || addressesResponse[0];
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.addressId);
                }
            } else {
                setAddresses([]);
                setSelectedAddressId(null);
            }

            const currentSelectedIds = JSON.parse(localStorage.getItem('selectedCartItemIds') || '[]');
            const validSelectedIds = combinedCartData
                .map(item => item.id)
                .filter(id => currentSelectedIds.includes(id));
            setSelectedItemIds(validSelectedIds);

        } catch (error) {
            setCartItems([]);
            setAddresses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCartAndAddressData();
    }, []);

    useEffect(() => {
        const preselectedItemId = location.state?.selectedItemId;

        if (preselectedItemId && cartItems.length > 0) {
            const itemExistsInCart = cartItems.some(item => item.id === preselectedItemId);

            if (itemExistsInCart) {
                setSelectedItemIds(prev => {
                    const newState = prev.includes(preselectedItemId) ? prev : [...prev, preselectedItemId];
                    localStorage.setItem('selectedCartItemIds', JSON.stringify(newState));
                    return newState;
                });
            }
        }
    }, [cartItems, location.state]);

    useEffect(() => {
        const newTotalPrice = cartItems
            .filter((item) => selectedItemIds.includes(item.id))
            .reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalPrice(newTotalPrice);
        localStorage.setItem('selectedCartItemIds', JSON.stringify(selectedItemIds));
    }, [cartItems, selectedItemIds]);


    const handleQuantityChange = (id, newQuantity) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    if (newQuantity > item.stock) {
                        return item;
                    }
                    if (newQuantity < 1) {
                        return { ...item, quantity: 1 };
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const handleRemove = async (itemId) => {
        const itemToDelete = cartItems.find(item => item.id === itemId);
        if (!itemToDelete) return;

        try {
            const idsToDelete = itemToDelete.orderItemIdsToDelete;
            const deletePromises = idsToDelete.map(orderItemId =>
                orderItemApi.deleteOrderItem(orderItemId)
            );

            await Promise.all(deletePromises);
            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
            await fetchCartAndAddressData();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItemIds.length === 0) {
            return;
        }

        setIsLoading(true);
        try {
            const allOrderItemsToDelete = cartItems
                .filter(item => selectedItemIds.includes(item.id))
                .flatMap(item => item.orderItemIdsToDelete);

            const deletePromises = allOrderItemsToDelete.map(orderItemId =>
                orderItemApi.deleteOrderItem(orderItemId)
            );

            await Promise.all(deletePromises);

            setSelectedItemIds([]);
            await fetchCartAndAddressData();

        } catch (error) {
            console.error("Lỗi khi xóa các sản phẩm đã chọn:", error);
            setIsLoading(false);
        }
    };


    const handleSelectItem = (itemId) => {
        setSelectedItemIds((prev) => {
            const newState = prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId];
            return newState;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItemIds(cartItems.map((item) => item.id));
        } else {
            setSelectedItemIds([]);
        }
    };

    const checkoutData = useMemo(() => {
        const selectedAddress = selectedAddressId;
        const itemsToPurchase = cartItems
            .filter(item => selectedItemIds.includes(item.id))
            .map(item => ({
                ...item,
                image: item.images?.[0]?.imageUrl || "https://placehold.co/100x100/e2e8f0/374151?text=?", // Pass only first image URL
                images: undefined 
            }));

        return {
            buyerId: parseInt(localStorage.getItem("userId"), 10) || 0,
            itemsToPurchase: itemsToPurchase,
            totalAmount: totalPrice,
            deliveryAddress: selectedAddress || null,
            allAddresses: addresses,
            selectedAddressId: selectedAddressId
        };
    }, [selectedItemIds, cartItems, totalPrice, addresses, selectedAddressId]);


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-[#FAF8F3]"><Spin size="large" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#FAF8F3] py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-12 bg-white p-4 font-bold text-[#2C2C2C] rounded-t-lg shadow-md border-b border-[#E8E4DC]">
                    <div className="col-span-5">Sản phẩm</div>
                    <div className="col-span-2 text-center">Đơn giá</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-2 text-center">Thành tiền</div>
                    <div className="col-span-1 text-center">Thao tác</div>
                </div>

                <div className="bg-white shadow-sm mb-4">
                    {cartItems.length > 0 ? (
                        <div>
                            <div className="p-4 font-semibold text-[#2C2C2C] border-b border-[#E8E4DC] flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-3 accent-[#D4AF37]"
                                    onChange={handleSelectAll}
                                    checked={selectedItemIds.length === cartItems.length && cartItems.length > 0}
                                    disabled={cartItems.length === 0}
                                />
                                {cartItems[0]?.store}
                            </div>
                            {cartItems.map((item) => (
                                <CardCart
                                    key={item.id}
                                    id={item.id}
                                    images={item.images} // Pass images array
                                    itemType={item.itemType} // Pass itemType
                                    title={item.name}
                                    price={item.price}
                                    quantity={item.quantity}
                                    stock={item.stock}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={() => handleRemove(item.id)}
                                    isSelected={selectedItemIds.includes(item.id)}
                                    onSelect={() => handleSelectItem(item.id)}
                                    formatVND={formatVND}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-10 text-gray-500 bg-white">
                            Giỏ hàng của bạn đang trống.
                        </div>
                    )}
                </div>

                <div className="bg-white mt-6 p-4 shadow-md rounded-lg border border-[#E8E4DC]">
                    <div className="flex justify-between items-center border-b border-[#E8E4DC] pb-3 mb-4">
                        <h2 className="text-lg font-bold text-[#B8860B] flex items-center gap-2"><FiMapPin /> Địa chỉ giao hàng</h2>
                        <Link to="/profile/address" className="text-[#B8860B] font-semibold hover:text-[#D4AF37] transition-colors">Quản lý địa chỉ</Link>
                    </div>
                    {addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.addressId}
                                    onClick={() => {
                                        setSelectedAddressId(addr.addressId),
                                         console.log(addr.addressId)}}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.addressId ? 'border-[#B8860B] bg-yellow-50' : 'border-[#E8E4DC] hover:border-[#C4B5A0]'
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
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Không tìm thấy địa chỉ nào. Vui lòng thêm địa chỉ giao hàng trong hồ sơ của bạn.</p>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white mt-6 p-4 gap-4 flex items-center justify-between shadow-lg rounded-lg border border-[#E8E4DC]">
                    <div className="flex items-center space-x-4 text-[#2C2C2C]">
                        <input
                            type="checkbox"
                            className="accent-[#D4AF37]"
                            onChange={handleSelectAll}
                            checked={
                                cartItems.length > 0 &&
                                selectedItemIds.length === cartItems.length
                            }
                            disabled={cartItems.length === 0}
                        />
                        <span>Chọn tất cả ({selectedItemIds.length})</span>
                        <button
                            className="text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
                            onClick={handleDeleteSelected}
                            disabled={selectedItemIds.length === 0 || isLoading}
                        >
                            Xóa
                        </button>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-[#2C2C2C]">
                            <span className="mr-2">Tổng cộng ({selectedItemIds.length} sản phẩm):</span>
                            <span className="text-[#B8860B] text-xl font-bold">
                                {formatVND(totalPrice)}
                            </span>
                        </div>
                        <Link to="/checkout" state={checkoutData}>
                            <button
                                className="bg-[#D4AF37] text-[#2C2C2C] px-8 py-3 rounded-lg font-bold shadow-md hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedItemIds.length === 0 || !selectedAddressId || isLoading}
                            >
                                Mua ngay
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;