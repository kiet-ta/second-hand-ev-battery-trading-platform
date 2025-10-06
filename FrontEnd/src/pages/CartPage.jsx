import React, { useEffect, useState } from "react";
import CardCart from "../components/Cards/CardCart";
import { Link } from "react-router-dom";

function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      store: "PeoPo Store",
      name: "Mô hình Amane Kanata Pop up Parade Figure - Hololive",
      price: 1350000,
      quantity: 1,
      stock: 1,
      image:
        "https://i.pinimg.com/736x/57/9b/67/579b679d630c3ec1463f36f02cebb1cd.jpg",
    },
    {
      id: 2,
      store: "PeoPo Store",
      name: "Keycap Takodachi - Hàng độc quyền PeoPo-made",
      price: 280000,
      quantity: 1,
      stock: 4,
      image:
        "https://i.pinimg.com/736x/e4/7f/21/e47f21f04ba75c4017105b8daaf67567.jpg",
    },
  ]);

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    setTotalPrice(
      cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
  }, [cartItems]); // 👈 recalc when cartItems changes

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
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
          <div className="p-4 font-medium border-b mt-5">
            <input type="checkbox" className="mr-2" />
            PeoPo Store
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
            />
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white mt-4 p-4 gap-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <input type="checkbox" />
            <span>Select all ({cartItems.length})</span>
            <button className="text-maincolor">Delete</button>
            <button className="text-maincolor">Add to favourite</button>
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <span className="mr-2">Total:</span>
              <span className="text-maincolor font-bold">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <Link to="/checkout" state={totalPrice}>
              <button className="bg-maincolor text-white px-6 py-2 rounded">
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
