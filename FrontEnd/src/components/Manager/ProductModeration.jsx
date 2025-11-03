import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Spin, Select, Space, Input, Modal } from "antd";
import { Check, XCircle, Search } from "lucide-react";
import { motion } from "framer-motion";
import itemApi from "../../api/itemApi";

const { Option } = Select;

export default function ProductModeration() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await itemApi.getItemDetail();
            const uniqueMap = new Map();
            data.forEach((item) => {
                const key = `${item.itemId}-${item.itemType}`;
                if (!uniqueMap.has(key)) uniqueMap.set(key, item);
            });

            // Sort by createdAt descending
            const sorted = Array.from(uniqueMap.values()).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setProducts(sorted);
        } catch (err) {
            console.error("❌ Lỗi tải sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];
        if (typeFilter !== "all")
            filtered = filtered.filter((p) => p.itemType === typeFilter);
        if (statusFilter !== "all") {
            filtered = filtered.filter((p) => {
                const st = p.moderation || "pending";
                return statusFilter === "pending" ? !p.moderation : st === statusFilter;
            });
        }
        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.title?.toLowerCase().includes(q) ||
                    p.evDetail?.brand?.toLowerCase().includes(q) ||
                    p.batteryDetail?.brand?.toLowerCase().includes(q)
            );
        }
        setFilteredProducts(filtered);
    }, [products, typeFilter, statusFilter, searchQuery]);

    const handleToggle = async (item) => {
        try {
            const updatedStatus =
                item.moderation === "approved_tag" ? "reject_tag" : "approved_tag";

            const payload = {
                ...item,
                updatedAt: new Date().toISOString(),
                moderation: updatedStatus,
                images:
                    item.itemImage?.map((img) => ({
                        imageId: img.imageId,
                        imageUrl: img.imageUrl,
                    })) || [],
                evDetail: item.evDetail || null,
                batteryDetail: item.batteryDetail || null,
            };
            await itemApi.putItem(item.itemId, payload);
            await fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "itemId",
            key: "itemId",
            align: "center",
            width: 80,
        },
        {
            title: "Hình ảnh",
            dataIndex: "itemImage",
            key: "itemImage",
            render: (_, record) => (
                <img
                    src={
                        record.itemImage?.[0]?.imageUrl || "https://via.placeholder.com/50"
                    }
                    alt="Ảnh"
                    className="w-12 h-12 object-cover rounded-md shadow-sm"
                />
            ),
        },
        {
            title: "Tên / Loại",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div>
                    <strong
                        className="text-[#4F39F6] hover:underline cursor-pointer"
                        onClick={() => {
                            setSelectedItem(record);
                            setIsModalOpen(true);
                        }}
                    >
                        {text}
                    </strong>
                    <div className="text-xs text-slate-500">
                        {record.itemType === "ev" ? "Xe điện" : "Pin"}
                    </div>
                </div>
            ),
        },
        {
            title: "Thương hiệu",
            render: (_, record) =>
                record.evDetail?.brand || record.batteryDetail?.brand || "N/A",
        },
        {
            title: "Giá (VND)",
            dataIndex: "price",
            render: (p) => p?.toLocaleString(),
        },
        {
            title: "Trạng thái",
            dataIndex: "moderation",
            render: (status) => {
                if (!status) return <Tag color="orange">Chờ duyệt</Tag>;
                const map = {
                    approved_tag: { color: "green", text: "Đã duyệt" },
                    reject_tag: { color: "red", text: "Từ chối" },
                };
                const info = map[status] || { color: "default", text: "Không rõ" };
                return <Tag color={info.color}>{info.text}</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "actions",
            align: "center",
            render: (_, record) => {
                const isApproved = record.moderation === "approved_tag";
                return (
                    <Button
                        type={isApproved ? "default" : "primary"}
                        danger={isApproved}
                        onClick={() => handleToggle(record)}
                    >
                        {isApproved ? "Từ chối" : "Duyệt"}
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-[#4F39F6]">
                    📦 Danh sách sản phẩm chờ duyệt
                </h2>

                <Space wrap>
                    <Input
                        prefix={<Search size={16} className="text-slate-400" />}
                        placeholder="Tìm theo tên hoặc thương hiệu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        style={{ width: 240 }}
                    />

                    <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
                        <Option value="all">Tất cả loại</Option>
                        <Option value="ev">Xe điện</Option>
                        <Option value="battery">Pin</Option>
                    </Select>

                    <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="pending">Chờ duyệt</Option>
                        <Option value="approved_tag">Đã duyệt</Option>
                        <Option value="reject_tag">Từ chối</Option>
                    </Select>
                </Space>
            </div>

            <div className="text-sm text-slate-600 mb-3">
                Hiển thị <b>{filteredProducts.length}</b> sản phẩm
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="itemId"
                    columns={columns}
                    dataSource={filteredProducts}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: true }}
                />
            )}

            {/* Modal details unchanged */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={950}
                title={
                    <b className="text-xl text-[#4F39F6] tracking-wide">
                        🔍 Chi tiết sản phẩm
                    </b>
                }
            >
                {selectedItem ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Details content stays same */}
                    </motion.div>
                ) : (
                    <div className="flex justify-center py-10">
                        <Spin size="large" />
                    </div>
                )}
            </Modal>
        </div>
    );
}
