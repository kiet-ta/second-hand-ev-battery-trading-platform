import React, { useEffect, useState } from "react";
import { Clock, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import SellerAuction from "../../components/Seller/SellerAuction";

export default function SellerAuctionListPage() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [fadeState, setFadeState] = useState("in");

    const token = localStorage.getItem("token");

    // ✅ Gọi API lấy danh sách đấu giá
    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const res = await fetch("https://localhost:7272/api/auction", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Không thể tải danh sách đấu giá");

            const data = await res.json();
            console.log("Kết quả API Đấu giá:", data);

            setAuctions(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Lỗi tải dữ liệu đấu giá:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    const openModal = () => {
        setShowModal(true);
        setFadeState("in");
    };

    const closeModal = (refresh = false) => {
        setFadeState("out");
        setTimeout(() => {
            setShowModal(false);
            if (refresh) fetchAuctions(); // ✅ Làm mới danh sách sau khi tạo mới
        }, 200);
    };

    const formatPrice = (v) =>
        new Intl.NumberFormat("vi-VN").format(v || 0) + " ₫";

    const formatTime = (t) => (t ? new Date(t).toLocaleString("vi-VN") : "--");

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case "UPCOMING":
                return "bg-yellow-100 text-yellow-700";
            case "ONGOING":
                return "bg-green-100 text-green-700";
            case "ENDED":
                return "bg-gray-100 text-gray-500";
            default:
                return "bg-gray-50 text-gray-400";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-6">
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Danh sách phiên đấu giá của tôi
                    </h1>
                    <button
                        onClick={openModal}
                        className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
                    >
                        + Tạo phiên đấu giá mới
                    </button>
                </div>

                {/* Loading & Error */}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                    </div>
                ) : error ? (
                    <p className="text-red-600 text-center">{error}</p>
                ) : auctions.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">
                        Chưa có phiên đấu giá nào.
                    </p>
                ) : (
                    // ✅ Danh sách đấu giá
                    <div className="space-y-4">
                        {auctions.map((a) => (
                            <div
                                key={a.auctionId}
                                className="flex items-center bg-white rounded-lg border border-gray-200 hover:shadow-md transition overflow-hidden"
                            >
                                {/* Ảnh */}
                                <div className="w-48 h-36 flex-shrink-0">
                                    <img
                                        src={
                                            a.imageUrl ||
                                            "https://via.placeholder.com/150x100?text=Đấu+giá"
                                        }
                                        alt={a.title || "Sản phẩm đấu giá"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 px-6 py-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {a.title || "Phiên đấu giá chưa đặt tên"}
                                        </h3>
                                        <span
                                            className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                                                a.status
                                            )}`}
                                        >
                                            {a.status?.toUpperCase() || "KHÔNG XÁC ĐỊNH"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                                        <div>
                                            <p>
                                                Giá khởi điểm:{" "}
                                                <span className="font-medium text-gray-800">
                                                    {formatPrice(a.startingPrice)}
                                                </span>
                                            </p>
                                            <p>
                                                Giá hiện tại:{" "}
                                                <span className="text-gray-900 font-semibold">
                                                    {formatPrice(a.currentPrice)}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p>
                                                Số lượt đặt giá:{" "}
                                                <span className="font-medium">{a.totalBids || 0}</span>
                                            </p>

                                            {/* ✅ Thêm thời gian bắt đầu & kết thúc */}
                                            <div className="flex flex-col text-xs text-gray-400 mt-1 space-y-1">
                                                <p className="flex items-center justify-end gap-1">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    Bắt đầu: {formatTime(a.startTime)}
                                                </p>
                                                <p className="flex items-center justify-end gap-1">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    Kết thúc: {formatTime(a.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hành động */}
                                    <div className="flex justify-end items-center gap-4 mt-3 text-sm">
                                        <button className="flex items-center gap-1 text-gray-700 hover:text-indigo-600">
                                            <Eye className="w-4 h-4" /> Xem chi tiết
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-700 hover:text-green-600">
                                            <Edit className="w-4 h-4" /> Chỉnh sửa
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-700 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal tạo mới */}
            {showModal && (
                <div
                    className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 ${fadeState === "in" ? "animate-fadeIn" : "animate-fadeOut"
                        }`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <SellerAuction onClose={() => closeModal(true)} />
                </div>
            )}
        </div>
    );
}
