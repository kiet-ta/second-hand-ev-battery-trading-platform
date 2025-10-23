import React, { useEffect, useState } from "react";
import {
    PlusCircle,
    Tag,
    Clock,
    CheckCircle,
    XCircle,
    Package,
} from "lucide-react";
import ProductCreationModal from "./ItemForm/ProductCreationModal";
import { message } from "antd";

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sellerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // ✅ Hàm lấy danh sách sản phẩm của người bán
    const fetchProducts = async () => {
        try {
            const res = await fetch(
                `https://localhost:7272/api/item/seller/${sellerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm.");
            const data = await res.json();
            setProducts(data || []);
        } catch (err) {
            console.error("❌ Lỗi tải sản phẩm:", err);
            setError(err.message);
            message.error("Không thể tải dữ liệu sản phẩm của bạn.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [sellerId]);

    const formatCurrency = (num) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(num || 0);

    // 🌀 Trạng thái tải hoặc lỗi
    if (loading)
        return (
            <div className="flex justify-center items-center h-[70vh] text-gray-500 text-lg">
                🔄 Đang tải danh sách sản phẩm...
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center h-[70vh] text-red-600 text-lg">
                ❌ {error}
            </div>
        );

    // 🧩 Giao diện chính
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            Sản phẩm của tôi
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Quản lý và theo dõi các sản phẩm bạn đã đăng bán
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <ProductCreationModal onSuccess={fetchProducts} />
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                {products.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-[60vh] text-gray-500">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                            alt="Không có sản phẩm"
                            className="w-28 mb-4 opacity-70"
                        />
                        <p className="text-lg font-medium">
                            Chưa có sản phẩm nào được đăng bán.
                        </p>
                        <p className="text-gray-400 mt-1 text-sm">
                            Nhấn nút <b>“+ Tạo sản phẩm mới”</b> để bắt đầu đăng bán.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((item) => (
                            <div
                                key={item.itemId}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                            >
                                {/* Ảnh sản phẩm */}
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
                                        className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${item.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {item.status === "active"
                                            ? "Đang hoạt động"
                                            : item.status === "pending"
                                                ? "Chờ duyệt"
                                                : "Không hoạt động"}
                                    </span>
                                </div>

                                {/* Thông tin sản phẩm */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                        {item.description || "Không có mô tả chi tiết."}
                                    </p>

                                    {/* Giá và ngày đăng */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-indigo-600 font-semibold text-lg">
                                            {formatCurrency(item.price)}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} />{" "}
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>

                                    {/* Thông tin phụ */}
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Tag size={14} /> {item.categoryName || "Không rõ danh mục"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {item.status === "active" ? (
                                                <CheckCircle size={14} className="text-green-600" />
                                            ) : (
                                                <XCircle size={14} className="text-gray-400" />
                                            )}
                                            {item.quantity || 0} trong kho
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
