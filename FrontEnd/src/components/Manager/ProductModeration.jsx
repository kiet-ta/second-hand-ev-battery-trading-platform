import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Tag,
    Button,
    Dropdown,
    Menu,
    Spin,
    message,
    Select,
    Space,
    Input,
    Modal,
} from "antd";
import {
    Check,
    XCircle,
    Search,
    Download,
    MoreHorizontal,
} from "lucide-react";
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

    // 📥 Lấy danh sách sản phẩm
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await itemApi.getItemDetail();
            const uniqueMap = new Map();
            data.forEach((item) => {
                const key = `${item.itemId}-${item.itemType}`;
                if (!uniqueMap.has(key)) uniqueMap.set(key, item);
            });
            setProducts(Array.from(uniqueMap.values()));
        } catch (err) {
            console.error("❌ Lỗi tải sản phẩm:", err);
            message.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 🎯 Lọc & tìm kiếm
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

    // ⚙️ Duyệt / Từ chối
    const handleAction = async (id, action) => {
        try {
            const item = await itemApi.getItemDetailByID(id);
            const payload = {
                ...item,
                updatedAt: new Date().toISOString(),
                moderation: action,
                images:
                    item.itemImage?.map((img) => ({
                        imageId: img.imageId,
                        imageUrl: img.imageUrl,
                    })) || [],
                evDetail: item.evDetail || null,
                batteryDetail: item.batteryDetail || null,
            };
            await itemApi.putItem(id, payload);
            message.success("✅ Cập nhật trạng thái thành công!");
            await fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("❌ Cập nhật thất bại");
        }
    };

    // 📤 Xuất CSV
    const exportToCSV = () => {
        if (filteredProducts.length === 0) {
            message.info("Không có dữ liệu để xuất.");
            return;
        }

        const headers = ["ID", "Tên sản phẩm", "Loại", "Thương hiệu", "Giá (VND)", "Trạng thái"];
        const rows = filteredProducts.map((p) => [
            p.itemId,
            p.title,
            p.itemType === "ev" ? "Xe điện" : "Pin",
            p.evDetail?.brand || p.batteryDetail?.brand || "N/A",
            p.price,
            p.moderation ? p.moderation.replace("_tag", "") : "pending",
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute(
            "download",
            `products_export_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 🧱 Cấu hình bảng
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
                    src={record.itemImage?.[0]?.imageUrl || "https://via.placeholder.com/50"}
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
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
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
            dataIndex: "brand",
            key: "brand",
            render: (_, record) =>
                record.evDetail?.brand || record.batteryDetail?.brand || "N/A",
        },
        {
            title: "Giá (VND)",
            dataIndex: "price",
            key: "price",
            render: (p) => p?.toLocaleString(),
        },
        {
            title: "Trạng thái",
            dataIndex: "moderation",
            key: "moderation",
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
                const menu = (
                    <Menu
                        onClick={({ key }) => handleAction(record.itemId, key)}
                        items={[
                            {
                                key: "approved_tag",
                                label: (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Check size={16} />
                                        Duyệt
                                    </div>
                                ),
                            },
                            {
                                key: "reject_tag",
                                label: (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <XCircle size={16} />
                                        Từ chối
                                    </div>
                                ),
                            },
                        ]}
                    />
                );
                return (
                    <Dropdown overlay={menu} trigger={["click"]}>
                        <Button type="text" icon={<MoreHorizontal size={18} />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm">
            {/* Bộ lọc và tìm kiếm */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-semibold">📦 Danh sách sản phẩm chờ duyệt</h2>

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

                    <Button type="default" icon={<Download size={16} />} onClick={exportToCSV}>
                        Xuất CSV
                    </Button>
                </Space>
            </div>

            {/* Đếm số lượng */}
            <div className="text-sm text-slate-600 mb-3">
                Hiển thị <b>{filteredProducts.length}</b> sản phẩm
                {typeFilter !== "all" && ` (loại: ${typeFilter})`}
                {statusFilter !== "all" && `, trạng thái: ${statusFilter}`}
                {searchQuery && `, tìm kiếm: “${searchQuery}”`}
            </div>

            {/* Bảng */}
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

            {/* Modal chi tiết sản phẩm */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                title={<b>Chi tiết sản phẩm</b>}
            >
                {selectedItem ? (
                    <div>
                        <div className="flex gap-4 mb-4">
                            {selectedItem.itemImage?.map((img) => (
                                <img
                                    key={img.imageId}
                                    src={img.imageUrl}
                                    alt="Ảnh sản phẩm"
                                    className="w-24 h-24 object-cover rounded-md border"
                                />
                            ))}
                        </div>
                        <p>
                            <b>Tên:</b> {selectedItem.title}
                        </p>
                        <p>
                            <b>Loại:</b> {selectedItem.itemType === "ev" ? "Xe điện" : "Pin"}
                        </p>
                        <p>
                            <b>Giá:</b> {selectedItem.price.toLocaleString()} VND
                        </p>
                        <p>
                            <b>Thương hiệu:</b>{" "}
                            {selectedItem.evDetail?.brand ||
                                selectedItem.batteryDetail?.brand ||
                                "N/A"}
                        </p>
                        <p>
                            <b>Trạng thái:</b>{" "}
                            {selectedItem.moderation
                                ? selectedItem.moderation.replace("_tag", "")
                                : "Chờ duyệt"}
                        </p>
                        <hr className="my-3" />
                        <h4 className="font-semibold mb-2">🔧 Thông tin chi tiết</h4>
                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                            {selectedItem.itemType === "ev"
                                ? Object.entries(selectedItem.evDetail || {}).map(([k, v]) => (
                                    <p key={k}>
                                        <b>{k}:</b> {String(v)}
                                    </p>
                                ))
                                : Object.entries(selectedItem.batteryDetail || {}).map(([k, v]) => (
                                    <p key={k}>
                                        <b>{k}:</b> {String(v)}
                                    </p>
                                ))}
                        </div>
                    </div>
                ) : (
                    <Spin />
                )}
            </Modal>
        </div>
    );
}
