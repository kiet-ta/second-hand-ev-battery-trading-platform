import React, { useEffect, useState, useMemo } from "react";
import CardCart from "../components/Cards/CardCart";
import { Link, useLocation } from "react-router-dom";
import orderItemApi from "../api/orderItemApi";
import itemApi from "../api/itemApi";
import addressApi from "../api/addressLocalApi";
import { message, Spin } from "antd";
import { FiMapPin } from "react-icons/fi";

function CartPage() {
    const location = useLocation(); 

    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    // Stores the item ID (item.id) of selected items
    const [selectedItemIds, setSelectedItemIds] = useState([]); 

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCartAndAddressData = async () => {
        setIsLoading(true);
        try {
            const userId = localStorage.getItem("userId");

            const [orderItemsResponse, addressesResponse] = await Promise.all([
                orderItemApi.getOrderItem(userId),
                addressApi.getAddressByUserId(userId)
            ]);

            // --- Process Cart Items ---
            let combinedCartData = [];
            if (orderItemsResponse && orderItemsResponse.length > 0) {
                const aggregatedItemsMap = new Map();
                
                // 1. Aggregate quantity AND collect all orderItemId's for deletion
                orderItemsResponse.forEach((item) => {
                    const existingItem = aggregatedItemsMap.get(item.itemId);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                        // ✨ Collect ALL original orderItem IDs
                        existingItem.orderItemIdsToDelete.push(item.orderItemId);
                    } else {
                        aggregatedItemsMap.set(item.itemId, { 
                            ...item,
                            // ✨ Initialize array with the first ID
                            orderItemIdsToDelete: [item.orderItemId]
                        });
                    }
                });
                
                const uniqueOrderItems = Array.from(aggregatedItemsMap.values());
                const itemDetailPromises = uniqueOrderItems.map((item) =>
                    itemApi.getItemDetailByID(item.itemId)
                );
                const itemDetails = await Promise.all(itemDetailPromises);

                let stockIssueDetected = false;

                combinedCartData = uniqueOrderItems
                    .map((orderItem) => {
                        const detail = itemDetails.find((d) => d.itemId === orderItem.itemId);
                        if (!detail) return null;

                        let finalQuantity = orderItem.quantity;
                        
                        // Cap the combined quantity at the available stock
                        if (orderItem.quantity > detail.quantity) {
                            finalQuantity = detail.quantity;
                            stockIssueDetected = true;
                        }
                        
                        return {
                            id: orderItem.itemId, 
                            store: "EV & Battery Store",
                            name: detail.title,
                            price: detail.price,
                            quantity: finalQuantity, 
                            stock: detail.quantity, 
                            image: "https://i.pinimg.com/736x/23/ce/34/23ce34eafe553b94f40bb67139abb923.jpg",
                            // ✨ Pass the list of OrderItem IDs needed for deletion
                            orderItemIdsToDelete: orderItem.orderItemIdsToDelete
                        };
                    }).filter(Boolean);
                
                setCartItems(combinedCartData);
                
                if (stockIssueDetected) {
                    message.warning("Some item quantities were adjusted to match available stock.");
                }
            } else {
                setCartItems([]);
            }

            // --- Process Addresses ---
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
            
            // Restore selections
            const currentSelectedIds = JSON.parse(localStorage.getItem('selectedCartItemIds') || '[]');
            const validSelectedIds = combinedCartData
                .map(item => item.id)
                .filter(id => currentSelectedIds.includes(id));
            setSelectedItemIds(validSelectedIds);

        } catch (error) {
            console.error("Failed to fetch page data:", error);
            message.error("Could not load your cart details. Please try again.");
            setCartItems([]);
            setAddresses([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Initial fetch
    useEffect(() => {
        fetchCartAndAddressData();
    }, []);

    // Handle preselected item from location state
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

    // Update total price and save selected IDs to local storage
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
                        message.warning(`Maximum quantity reached for ${item.name}. Stock available: ${item.stock}.`);
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

    /**
     * Deletes all OrderItem records associated with a single combined cart item.
     * @param {number} itemId - The ID of the combined item.
     */
    const handleRemove = async (itemId) => {
        const itemToDelete = cartItems.find(item => item.id === itemId);
        if (!itemToDelete) return;

        try {
            // ✨ Get all individual orderItemIds
            const idsToDelete = itemToDelete.orderItemIdsToDelete;
            const deletePromises = idsToDelete.map(orderItemId => 
                // Call the API for EACH orderItemId
                orderItemApi.deleteOrderItem(orderItemId)
            );
            
            await Promise.all(deletePromises);
            message.success("Item removed from cart successfully!");
            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
            await fetchCartAndAddressData(); 
        } catch (error) {
            console.error("Failed to remove item:", error);
            message.error("Could not remove item. Please try again.");
        }
    };
    
    /**
     * Handles removing all selected items from the cart.
     */
    const handleDeleteSelected = async () => {
        if (selectedItemIds.length === 0) {
            message.warning("Please select items to delete.");
            return;
        }

        setIsLoading(true);
        try {
            // Collect all individual orderItemId's from all selected combined items
            const allOrderItemsToDelete = cartItems
                .filter(item => selectedItemIds.includes(item.id))
                // ✨ Flatten the orderItemIdsToDelete array from all selected items
                .flatMap(item => item.orderItemIdsToDelete);

            const deletePromises = allOrderItemsToDelete.map(orderItemId => 
                // Call the API for EACH individual orderItemId
                orderItemApi.deleteOrderItem(orderItemId)
            );
            
            await Promise.all(deletePromises);
            message.success(`${selectedItemIds.length} item(s) removed from cart successfully!`);
            
            setSelectedItemIds([]);
            await fetchCartAndAddressData(); 
            
        } catch (error) {
            console.error("Failed to delete selected items:", error);
            message.error("Could not delete selected items. Please try again.");
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
        const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
        return {
            buyerId: parseInt(localStorage.getItem("userId"), 10) || 0,
            itemsToPurchase: cartItems.filter(item => selectedItemIds.includes(item.id)),
            totalAmount: totalPrice,
            deliveryAddress: selectedAddress || null,
        };
    }, [selectedItemIds, cartItems, totalPrice, addresses, selectedAddressId]);


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4">
                {/* Header Row */}
                <div className="grid grid-cols-12 bg-white p-4 font-semibold rounded-t-lg shadow-sm">
                    <div className="col-span-5">Products</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Subtotal</div>
                    <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Cart Items */}
                <div className="bg-white shadow-sm">
                    {cartItems.length > 0 ? (
                        <div>
                            <div className="p-4 font-medium border-b flex items-center">
                                <input 
                                    type="checkbox" 
                                    className="mr-2" 
                                    onChange={handleSelectAll}
                                    checked={selectedItemIds.length === cartItems.length && cartItems.length > 0}
                                    disabled={cartItems.length === 0}
                                />
                                EV & Battery Store
                            </div>
                            {cartItems.map((item) => (
                                <CardCart
                                    key={item.id}
                                    id={item.id}
                                    image={item.image}
                                    title={item.name}
                                    price={item.price}
                                    quantity={item.quantity}
                                    stock={item.stock}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={() => handleRemove(item.id)}
                                    isSelected={selectedItemIds.includes(item.id)}
                                    onSelect={() => handleSelectItem(item.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-10 bg-white">
                            Your cart is empty.
                        </div>
                    )}
                </div>

                {/* Address Selection Section */}
                <div className="bg-white mt-4 p-4 shadow-sm rounded-lg">
                    <div className="flex justify-between items-center border-b pb-3 mb-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2"><FiMapPin /> Delivery Address</h2>
                        <button className="text-maincolor font-medium">Manage Addresses</button>
                    </div>
                    {addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.addressId}
                                    onClick={() => setSelectedAddressId(addr.addressId)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        selectedAddressId === addr.addressId ? 'border-maincolor bg-blue-50' : 'border-gray-200 hover:border-gray-400'
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
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No addresses found. Please add a delivery address to your profile.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white mt-4 p-4 gap-4 flex items-center justify-between shadow-sm rounded-lg">
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                                cartItems.length > 0 &&
                                selectedItemIds.length === cartItems.length
                            }
                            disabled={cartItems.length === 0}
                        />
                        <span>Select all ({selectedItemIds.length})</span>
                        <button 
                            className="text-red-600 font-medium disabled:opacity-50"
                            onClick={handleDeleteSelected}
                            disabled={selectedItemIds.length === 0 || isLoading}
                        >
                            Delete
                        </button>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div>
                            <span className="mr-2">Total ({selectedItemIds.length} items):</span>
                            <span className="text-maincolor text-xl font-bold">
                                {totalPrice.toLocaleString('vi-VN')} VND
                            </span>
                        </div>
                        <Link to="/checkout" state={checkoutData}>
                            <button
                                className="bg-maincolor text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedItemIds.length === 0 || !selectedAddressId || isLoading}
                            >
                                Buy Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;