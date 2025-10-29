import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId || !token) return;

      try {
        const res = await fetch(`${BASE_URL}OrderItems/cart/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Lỗi khi lấy giỏ hàng");
        const data = await res.json();
        setCartCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error("❌ Không thể tải giỏ hàng:", err);
        setCartCount(0);
      }
    };

    fetchCart();

    //Sự kiện cập nhật giỏ hàng
    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, [userId, token]);

  return (
    <div className="relative">
      <Link
        to="/cart"
        className="relative text-gray-700 hover:text-blue-600 transition"
      >
        <IoCartOutline size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
