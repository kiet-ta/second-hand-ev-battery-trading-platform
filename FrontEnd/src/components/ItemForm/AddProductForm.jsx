import React, { useState, useEffect } from "react";
import { Table, Tag, Image, message } from "antd";
import ProductCreationModal from "./ProductCreationModal";
import { Package, Clock, Eye } from "lucide-react";

export default function MyProductsPage() {
    const [myItems, setMyItems] = useState([]);
    const [isListLoading, setIsListLoading] = useState(false);
    const userID = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // Lấy danh sách sản phẩm người bán
    const fetchMyItems = async () => {
        setIsListLoading(true);
        try {
            const res = await fetch(`${baseURL}sellers/${userID}/item`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) throw new Error("Không thể tải sản phẩm của bạn");
            const data = await res.json();
            setMyItems(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error("❌ Lỗi tải sản phẩm:", error);
        } finally {
            setIsListLoading(false);
        }
    };

    useEffect(() => {
        fetchMyItems();
    }, []);

    // Định dạng tiền tệ
    const formatPrice = (v) =>
        v?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "—";

    // Màu trạng thái
    const getStatusTag = (status) => {
        switch (status?.toLowerCase()) {
            case "Active_ItemStatus":
                return <Tag color="green">Đang bán</Tag>;
            case "Sold":
                return <Tag color="blue">Đã bán</Tag>;
            case "Pending":
                return <Tag color="orange">Chờ duyệt</Tag>;
            case "Rejected_ItemStatus":
                return <Tag color="red">Bị từ chối</Tag>;
            default:
                return <Tag color="gray">Không xác định</Tag>;
        }
    };

    // Cột hiển thị
    const columns = [
        {
            title: "Ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (url) => (
                <Image
                    src={url || "https://via.placeholder.com/120x80?text=No+Image"}
                    alt="Ảnh sản phẩm"
                    width={100}
                    height={70}
                    className="rounded-md object-cover"
                />
            ),
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <span className="font-semibold text-gray-800">
                    {text || "—"}{" "}
                    <span className="text-gray-400 text-sm">#{record.itemId}</span>
                </span>
            ),
        },
        {
            title: "Loại sản phẩm",
            dataIndex: "itemType",
            key: "itemType",
            render: (type) =>
                type === "Battery" ? (
                    <Tag color="geekblue">Pin</Tag>
                ) : (
                    <Tag color="purple">Xe điện</Tag>
                ),
        },
        {
            title: "Giá niêm yết",
            dataIndex: "listedPrice",
            key: "listedPrice",
            render: (price) => <span className="text-gray-700">{formatPrice(price)}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => getStatusTag(status),
        },
        {
            title: "Ngày đăng",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) =>
                date ? new Date(date).toLocaleDateString("vi-VN") : "—",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <button
                    onClick={() => message.info(`👀 Xem chi tiết sản phẩm ${record.title}`)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition"
                >
                    <Eye size={16} /> Xem
                </button>
            ),
        },
    ];

    return (
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Sản phẩm của tôi</h1>
                        <p className="text-gray-600">
                            Quản lý danh sách xe điện & pin mà bạn đã đăng bán
                        </p>
                    </div>
                    <ProductCreationModal onSuccess={fetchMyItems} />
                </div>

                {/* Bảng sản phẩm */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    {myItems.length === 0 && !isListLoading ? (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-lg text-gray-600">
                                Bạn chưa có sản phẩm nào được đăng.
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Hãy nhấn nút <b>“+ Tạo sản phẩm mới”</b> để bắt đầu đăng bán.
                            </p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={myItems}
                            loading={isListLoading}
                            rowKey="itemId"
                            pagination={{ pageSize: 8, showSizeChanger: false }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
