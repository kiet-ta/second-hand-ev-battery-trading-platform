import React, { useEffect, useState } from "react";
import { Clock, Tag, CheckCircle, XCircle } from "lucide-react";
import ProductCreationModal from "./ItemForm/ProductCreationModal";

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sellerId = localStorage.getItem("userId");

    // Fetch all products for this seller
    const fetchProducts = async () => {
        if (!sellerId) {
            setError("User ID not found");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://localhost:7272/api/item/seller/${sellerId}`);
            if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products on mount
    useEffect(() => {
    if (!sellerId) return;
    fetchProducts();
}, []);

    // Format price
    const formatCurrency = (num) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

    if (loading)
        return (
            <div className="flex justify-center items-center h-[70vh] text-gray-500 text-lg">
                🔄 Đang tải sản phẩm...
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center h-[70vh] text-red-600 text-lg">
                ❌ {error}
            </div>
        );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                {/* Modal to add new product */}
                <ProductCreationModal onSuccess={fetchProducts} />
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-[60vh] text-gray-500">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                        alt="No data"
                        className="w-28 mb-4 opacity-70"
                    />
                    <p className="text-lg font-medium">Chưa có sản phẩm nào được đăng bán.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((item) => (
                        <div
                            key={item.itemId}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                        >
                            <div className="relative">
                                <img
                                    src={
                                        item.images?.[0]?.imageUrl ||
                                        "https://via.placeholder.com/400x250?text=No+Image"
                                    }
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                />
                                <span
                                    className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
                                        item.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {item.status}
                                </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                        {item.description || "Không có mô tả"}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-blue-600 font-semibold text-lg">
                                            {formatCurrency(item.price)}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} />{" "}
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Tag size={14} /> {item.categoryName || "N/A"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {item.status === "active" ? (
                                                <CheckCircle size={14} className="text-green-600" />
                                            ) : (
                                                <XCircle size={14} className="text-gray-400" />
                                            )}
                                            {item.quantity} in stock
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
