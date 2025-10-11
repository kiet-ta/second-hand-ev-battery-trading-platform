import React, { useEffect, useState } from "react";
import CardCart from "../components/Cards/CardCart";
import { Link } from "react-router-dom";
import orderItemApi from "../api/orderItemApi";
import itemApi from "../api/itemApi";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  // ✨ 1. Add state to track selected item IDs
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const fetchCartDetails = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const orderItems = await orderItemApi.getOrderItem(userId);

      if (!orderItems || orderItems.length === 0) {
        setCartItems([]);
        return;
      }

      const aggregatedItemsMap = new Map();
      orderItems.forEach((item) => {
        if (aggregatedItemsMap.has(item.itemId)) {
          const existingItem = aggregatedItemsMap.get(item.itemId);
          existingItem.quantity += item.quantity;
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
            id: orderItem.itemId, // This is the itemId
            store: "EV & Battery Store",
            name: detail.title,
            price: detail.price,
            quantity: orderItem.quantity,
            stock: detail.quantity,
            image: "https://i.pinimg.com/736x/23/ce/34/23ce34eafe553b94f40bb67139abb923.jpg",
          };
        })
        .filter(Boolean);

      setCartItems(combinedCartData);
    } catch (error) {
      console.error("Failed to fetch cart details:", error);
    }
  };

  // ✨ 2. Update total price based on SELECTED items
  useEffect(() => {
    const newTotalPrice = cartItems
      .filter((item) => selectedItemIds.includes(item.id)) // Only include selected items in the total
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(newTotalPrice);
  }, [cartItems, selectedItemIds]); // Re-calculate when selection changes

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    // ✨ Also remove from selected items if it's removed from the cart
    setSelectedItemIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  // ✨ 3. Handler to add/remove an item from the selection
  const handleSelectItem = (itemId) => {
    setSelectedItemIds((prevSelected) => {
      if (prevSelected.includes(itemId)) {
        // If already selected, remove it (deselect)
        return prevSelected.filter((id) => id !== itemId);
      } else {
        // If not selected, add it
        return [...prevSelected, itemId];
      }
    });
  };

  // ✨ 4. Handler for the "Select All" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // If checking the box, select all item IDs
      setSelectedItemIds(cartItems.map((item) => item.id));
    } else {
      // If unchecking, clear the selection
      setSelectedItemIds([]);
    }
  };

  // ✨ 5. Prepare the data for the checkout page
  const checkoutData = {
    buyerId: parseInt(localStorage.getItem("userId"), 10) || 0,
    itemsToPurchase: cartItems.filter(item => selectedItemIds.includes(item.id)),
    totalAmount: totalPrice,
};


  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header Row */}
        <div className="grid grid-cols-12 bg-white p-4 font-semibold">
          <div className="col-span-1">Products</div>
          <div className="col-span-4"></div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-1 text-center">Quantity</div>
          <div className="col-span-3 text-center">Subtotal</div>
          <div className="col-span-1 text-center">Action</div>
        </div>

        {/* Cart Items */}
        <div className="bg-white divide-y">
          {cartItems.length > 0 ? (
            <div className="bg-white divide-y">
              <div className="p-4 font-medium border-b mt-5">
                <input type="checkbox" className="mr-2" disabled />
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
                  // ✨ 6. Pass selection props to the CardCart component
                  isSelected={selectedItemIds.includes(item.id)}
                  onSelect={() => handleSelectItem(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-white mt-4">
              Your cart is empty.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white mt-4 p-4 gap-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* ✨ 7. Wire up the "Select All" checkbox */}
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
            <button className="text-maincolor">Add to favourite</button>
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <span className="mr-2">Total ({selectedItemIds.length} items):</span>
              <span className="text-maincolor font-bold">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            {/* ✨ 8. Pass the prepared checkoutData object in the link's state */}
            <Link to="/checkout" state={checkoutData}>
              <button 
                className="bg-maincolor text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={selectedItemIds.length === 0} // Disable if nothing is selected
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