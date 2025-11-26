import React, { useEffect, useState, useMemo } from "react";
import CardCart from "../../components/Cards/CardCart";
import { Link, useLocation } from "react-router-dom";
import orderItemApi from "../../api/orderItemApi";
import itemApi from "../../api/itemApi";
import addressApi from "../../api/addressLocalApi";
import { Spin } from "antd";
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
        if (typeof price !== "number") return "0 đ";
        return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
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
                    const existing = aggregatedItemsMap.get(item.itemId);
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.orderItemIdsToDelete.push(item.orderItemId);
                    } else {
                        aggregatedItemsMap.set(item.itemId, {
                            ...item,
                            orderItemIdsToDelete: [item.orderItemId] // make sure item.orderItemId exists
                        });
                    }
                });
                const duplicateIds = [];
                aggregatedItemsMap.forEach((item) => {
                    if (item.orderItemIdsToDelete.length > 1) {
                        const [keep, ...toDelete] = item.orderItemIdsToDelete;
                        item.orderItemIdsToDelete = [keep];
                        duplicateIds.push(...toDelete);
                    }
                });

                if (duplicateIds.length > 0) {
                    await Promise.all(
                        duplicateIds.map((id) => orderItemApi.deleteOrderItem(id))
                    );
                }

                const uniqueOrderItems = Array.from(aggregatedItemsMap.values());
                const itemDetails = await Promise.all(
                    uniqueOrderItems.map((i) => itemApi.getItemById(i.itemId))
                );

                combinedCartData = uniqueOrderItems.map((orderItem) => {
                    const detail = itemDetails.find((d) => d.itemId === orderItem.itemId);
                    if (!detail) return null;

                    return {
                        id: orderItem.itemId,
                        store: "Cửa hàng EV & Pin",
                        name: detail.title,
                        price: detail.price,
                        quantity: orderItem.quantity,
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
                const defaultAddr =
                    addressesResponse.find((a) => a.isDefault) || addressesResponse[0];
                if (defaultAddr) setSelectedAddressId(defaultAddr.addressId);
            } else {
                setAddresses([]);
                setSelectedAddressId(null);
            }

            const savedSelectedIds = JSON.parse(
                localStorage.getItem("selectedCartItemIds") || "[]"
            );
            const validIds = combinedCartData
                .map((i) => i.id)
                .filter((id) => savedSelectedIds.includes(id));

            setSelectedItemIds(validIds);
        } catch {
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
        const preselected = location.state?.selectedItemId;

        if (preselected && cartItems.length > 0) {
            const exists = cartItems.some((i) => i.id === preselected);
            if (exists) {
                setSelectedItemIds((prev) => {
                    const newState = prev.includes(preselected)
                        ? prev
                        : [...prev, preselected];
                    localStorage.setItem(
                        "selectedCartItemIds",
                        JSON.stringify(newState)
                    );
                    return newState;
                });
            }
        }
    }, [cartItems, location.state]);

    useEffect(() => {
        const total = cartItems
            .filter((i) => selectedItemIds.includes(i.id))
            .reduce((sum, i) => sum + i.price * i.quantity, 0);

        setTotalPrice(total);
        localStorage.setItem("selectedCartItemIds", JSON.stringify(selectedItemIds));
    }, [cartItems, selectedItemIds]);

    const handleUpdateQuantity = async (id, newQuantity) => {
        const item = cartItems.find((i) => i.id === id);
        if (!item) return;
        if (newQuantity > item.stock) newQuantity = item.stock;
        const orderItemId = item.orderItemIdsToDelete[0];
            await orderItemApi.putOrderItem(orderItemId, {
                quantity: newQuantity,
                price: item.price
            });

            fetchCartAndAddressData();
    };

    const handleRemove = async (itemId) => {
        const item = cartItems.find((i) => i.id === itemId);
        if (!item) return;

            await Promise.all(
                item.orderItemIdsToDelete.map((id) =>
                    orderItemApi.deleteOrderItem(id)
                )
            );

            setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
            fetchCartAndAddressData();
    };

    const handleDeleteSelected = async () => {
        if (selectedItemIds.length === 0) return;

        setIsLoading(true);
        try {
            const idsToDelete = cartItems
                .filter((i) => selectedItemIds.includes(i.id))
                .flatMap((i) => i.orderItemIdsToDelete);

            await Promise.all(
                idsToDelete.map((id) => orderItemApi.deleteOrderItem(id))
            );

            setSelectedItemIds([]);
            fetchCartAndAddressData();
        } catch {
            setIsLoading(false);
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItemIds(cartItems.map((i) => i.id));
        } else {
            setSelectedItemIds([]);
        }
    };

    const checkoutData = useMemo(() => {
        const itemsToPurchase = cartItems
            .filter((i) => selectedItemIds.includes(i.id));

        const orderItemIds = itemsToPurchase.flatMap(i => i.orderItemIdsToDelete);

        const selectedAddress = addresses.find(a => a.addressId === selectedAddressId);

        return {
            buyerId: parseInt(localStorage.getItem("userId"), 10),
            addressId: selectedAddress?.addressId || 0,
            orderItemIds,
            shippingPrice: 0, // can update later in CheckoutPage after GHN calculation
            createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
            itemsToPurchase // keep for display in CheckoutPage
        };
    }, [selectedItemIds, cartItems, addresses, selectedAddressId]);
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#FAF8F3]">
                <Spin size="large" />
            </div>
        );
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
                                    checked={
                                        selectedItemIds.length === cartItems.length
                                    }
                                    disabled={cartItems.length === 0}
                                />
                                {cartItems[0]?.store}
                            </div>

                            {cartItems.map((item) => (
                                <CardCart
                                    key={item.id}
                                    id={item.id}
                                    images={item.images}
                                    itemType={item.itemType}
                                    title={item.name}
                                    price={item.price}
                                    quantity={item.quantity}
                                    stock={item.stock}
                                    onQuantityChange={handleUpdateQuantity}
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
                        <h2 className="text-lg font-bold text-[#B8860B] flex items-center gap-2">
                            <FiMapPin /> Địa chỉ giao hàng
                        </h2>
                        <Link
                            to="/profile/address"
                            className="text-[#B8860B] font-semibold hover:text-[#D4AF37] transition-colors"
                        >
                            Quản lý địa chỉ
                        </Link>
                    </div>

                    {addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.addressId}
                                    onClick={() => setSelectedAddressId(addr.addressId)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.addressId
                                        ? "border-[#B8860B] bg-yellow-50"
                                        : "border-[#E8E4DC] hover:border-[#C4B5A0]"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-[#2C2C2C]">
                                                {addr.recipientName} | {addr.phone}
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                                            </p>
                                        </div>
                                        {addr.isDefault && (
                                            <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full">
                                                Mặc định
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            Không tìm thấy địa chỉ nào.
                        </p>
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
                            <span className="mr-2">
                                Tổng cộng ({selectedItemIds.length} sản phẩm):
                            </span>
                            <span className="text-[#B8860B] text-xl font-bold">
                                {formatVND(totalPrice)}
                            </span>
                        </div>

                        <Link to="/checkout" state={checkoutData}>
                            <button
                                className="bg-[#D4AF37] text-[#2C2C2C] px-8 py-3 rounded-lg font-bold shadow-md hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                    selectedItemIds.length === 0 ||
                                    !selectedAddressId ||
                                    isLoading
                                }
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
