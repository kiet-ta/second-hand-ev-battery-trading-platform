import React, { useEffect, useState, useMemo } from "react";
import CardCart from "../components/Cards/CardCart";
import { Link } from "react-router-dom";
import orderItemApi from "../api/orderItemApi";
import itemApi from "../api/itemApi";
import addressApi from "../api/addressLocalApi"; // ✨ 1. Import addressApi
import { message, Spin } from "antd"; // ✨ For user feedback
import { FiMapPin } from "react-icons/fi"; // ✨ For a nice icon

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // ✨ 2. Add state for addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Single loading state

  const fetchCartAndAddressData = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      // ✨ 3. Fetch cart items and addresses in parallel for better performance
      const [orderItemsResponse, addressesResponse] = await Promise.all([
        orderItemApi.getOrderItem(userId),
        addressApi.getAddressByUserId(userId) // Assuming this method exists
      ]);

      // --- Process Cart Items (your existing logic) ---
      if (orderItemsResponse && orderItemsResponse.length > 0) {
        const aggregatedItemsMap = new Map();
        orderItemsResponse.forEach((item) => {
          if (aggregatedItemsMap.has(item.itemId)) {
            aggregatedItemsMap.get(item.itemId).quantity += item.quantity;
          } else {
            aggregatedItemsMap.set(item.itemId, { ...item });
          }
        });
        const uniqueOrderItems = Array.from(aggregatedItemsMap.values());
        const itemDetailPromises = uniqueOrderItems.map((item) =>
          itemApi.getItemDetailByID(item.itemId)
        );
        const itemDetails = await Promise.all(itemDetailPromises);
        const combinedCartData = uniqueOrderItems
          .map((orderItem) => {
            const detail = itemDetails.find((d) => d.itemId === orderItem.itemId);
            if (!detail) return null;
            return {
              id: orderItem.itemId,
              store: "EV & Battery Store",
              name: detail.title,
              price: detail.price,
              quantity: orderItem.quantity,
              stock: detail.quantity,
              image: "https://i.pinimg.com/736x/23/ce/34/23ce34eafe553b94f40bb67139abb923.jpg",
            };
          }).filter(Boolean);
        setCartItems(combinedCartData);
      }

      // ✨ 4. Process Addresses
      if (addressesResponse && addressesResponse.length > 0) {
        setAddresses(addressesResponse);
        // Automatically select the default address, or the first one if no default exists
        const defaultAddress = addressesResponse.find(addr => addr.isDefault) || addressesResponse[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.addressId);
        }
      }

    } catch (error) {
      console.error("Failed to fetch page data:", error);
      message.error("Could not load your cart details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndAddressData();
  }, []);

  useEffect(() => {
    const newTotalPrice = cartItems
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(newTotalPrice);
  }, [cartItems, selectedItemIds]);

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItemIds(cartItems.map((item) => item.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  // ✨ 5. Memoize checkoutData to include the selected address object
  const checkoutData = useMemo(() => {
    const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
    return {
      buyerId: parseInt(localStorage.getItem("userId"), 10) || 0,
      itemsToPurchase: cartItems.filter(item => selectedItemIds.includes(item.id)),
      totalAmount: totalPrice,
      deliveryAddress: selectedAddress || null, // Add the full address object
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
              <div className="p-4 font-medium border-b">
                <input type="checkbox" className="mr-2" disabled checked />
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

        {/* ✨ 6. Address Selection Section */}
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
            />
            <span>Select all ({selectedItemIds.length})</span>
            <button className="text-maincolor">Delete</button>
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
                disabled={selectedItemIds.length === 0 || !selectedAddressId}
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