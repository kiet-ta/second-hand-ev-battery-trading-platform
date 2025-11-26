import React, { useEffect, useState } from "react";
import {
    Table,
    Tag,
    Button,
    Dropdown,
    Menu,
    Spin,
    Select,
    Space,
    Input,
    Modal,
    Divider,
} from "antd";
import {
    Check,
    XCircle,
    Search,
    Download,
    MoreHorizontal,
    Settings,
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

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await itemApi.getItemDetail();
            const uniqueMap = new Map();
            data.filter(res => res.moderation != 'Not_Submitted').forEach((item) => {
                const key = `${item.itemId}-${item.itemType}`;
                if (!uniqueMap.has(key)) uniqueMap.set(key, item);
            });
            setProducts(Array.from(uniqueMap.values()));
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
                const st = p.moderation || "Pending";
                return statusFilter === "Pending" ? !p.moderation : st === statusFilter;
            });
        }
        if (searchQuery.trim() !== "") {
            const q = searchQuery;
            filtered = filtered.filter(
                (p) =>
                    p.title?.includes(q) ||
                    p.evDetail?.brand?.includes(q) ||
                    p.batteryDetail?.brand?.includes(q)
            );
        }
        setFilteredProducts(filtered);
    }, [products, typeFilter, statusFilter, searchQuery]);

    const handleAction = async (id, action) => {
        try {
            const item = await itemApi.getItemDetailByID(id);
            const payload = {
                ...item,
                updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
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
                    Approved: { color: "green", text: "Đã duyệt" },
                    Rejected: { color: "red", text: "Từ chối" },
                    Pending: { color: "orange", text: "Chờ duyệt" }
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
                                key: "Approved",
                                label: (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Check size={16} />
                                        Duyệt
                                    </div>
                                ),
                            },
                            {
                                key: "Rejected",
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
            {/* Bộ lọc & tìm kiếm */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-[#4F39F6]">
                    📦 Danh sách sản phẩm chờ duyệt
                </h2>

                <Space wrap>

                    <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
                        <Option value="all">Tất cả loại</Option>
                        <Option value="ev">Xe điện</Option>
                        <Option value="battery">Pin</Option>
                    </Select>

                    <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="Pending">Chờ duyệt</Option>
                        <Option value="Approved">Đã duyệt</Option>
                        <Option value="Rejected">Từ chối</Option>
                    </Select>
                </Space>
            </div>

            {/* Đếm số lượng */}
            <div className="text-sm text-slate-600 mb-3">
                Hiển thị <b>{filteredProducts.length}</b> sản phẩm
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

            {/* 🟣 Modal chi tiết sản phẩm (phóng to hình & chữ) */}
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
                        {/* Hình ảnh */}
                        <div className="flex gap-5 justify-center flex-wrap">
                            {selectedItem.itemImage?.map((img) => (
                                <img
                                    key={img.imageId}
                                    src={img.imageUrl}
                                    alt="Ảnh sản phẩm"
                                    className="w-56 h-56 object-cover rounded-2xl border border-gray-300 shadow-lg hover:scale-105 transition-transform duration-300"
                                />
                            ))}
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200">


                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-4 text-gray-800 text-base leading-relaxed">
                                <p><b className="font-semibold">Tên sản phẩm:</b> {selectedItem.title}</p>
                                <p><b className="font-semibold">Loại:</b> {selectedItem.itemType === "ev" ? "Xe điện" : "Pin"}</p>
                                <p><b className="font-semibold">Giá:</b> {selectedItem.price.toLocaleString()} VND</p>
                                <p>
                                    <b className="font-semibold">Trạng thái:</b>{" "}
                                    <Tag
                                        color={
                                            selectedItem.moderation?.includes("reject")
                                                ? "error"
                                                : selectedItem.moderation?.includes("approve")
                                                    ? "success"
                                                    : "warning"
                                        }
                                        className="ml-1 text-base px-3 py-1 rounded-md"
                                    >
                                        {selectedItem.moderation || "Chờ duyệt"}
                                    </Tag>
                                </p>

                                {selectedItem.itemType === "ev" ? (
                                    <>
                                        <p><b className="font-semibold">Mã sản phẩm:</b> {selectedItem.evDetail?.itemId}</p>
                                        <p><b className="font-semibold">Thương hiệu:</b> {selectedItem.evDetail?.brand}</p>
                                        <p><b className="font-semibold">Dòng xe:</b> {selectedItem.evDetail?.model}</p>
                                        <p><b className="font-semibold">Phiên bản:</b> {selectedItem.evDetail?.version}</p>
                                        <p><b className="font-semibold">Năm sản xuất:</b> {selectedItem.evDetail?.year}</p>
                                        <p><b className="font-semibold">Màu sắc:</b> {selectedItem.evDetail?.color}</p>
                                        <p><b className="font-semibold">Kiểu dáng:</b> {selectedItem.evDetail?.bodyStyle}</p>
                                        <p><b className="font-semibold">Biển số:</b> {selectedItem.evDetail?.licensePlate}</p>
                                        <p><b className="font-semibold">Chủ sở hữu trước:</b> {selectedItem.evDetail?.previousOwners}</p>
                                        <p><b className="font-semibold">Số km đã đi:</b> {selectedItem.evDetail?.mileage} km</p>
                                        <p><b className="font-semibold">Phụ kiện đi kèm:</b> {selectedItem.evDetail?.hasAccessories ? "Có" : "Không"}</p>
                                        <p><b className="font-semibold">Giấy đăng ký hợp lệ:</b> {selectedItem.evDetail?.isRegistrationValid ? "Có" : "Không"}</p>
                                        <p>
                                            <b className="font-semibold">Giấy phép xe:</b>{" "}
                                            <a
                                                href={selectedItem.evDetail?.licenseUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#4F39F6] underline hover:text-[#3a28c6] font-medium"
                                            >
                                                Xem hình
                                            </a>
                                        </p>
                                        <p><b className="font-semibold">Ngày cập nhật:</b> {new Date(selectedItem.evDetail?.updatedAt).toLocaleString()}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><b className="font-semibold">Mã sản phẩm:</b> {selectedItem.batteryDetail?.itemId}</p>
                                        <p><b className="font-semibold">Thương hiệu:</b> {selectedItem.batteryDetail?.brand}</p>
                                        <p><b className="font-semibold">Model:</b> {selectedItem.batteryDetail?.model}</p>
                                        <p><b className="font-semibold">Dung lượng:</b> {selectedItem.batteryDetail?.capacity} kWh</p>
                                        <p><b className="font-semibold">Điện áp:</b> {selectedItem.batteryDetail?.voltage} V</p>
                                        <p><b className="font-semibold">Số chu kỳ sạc:</b> {selectedItem.batteryDetail?.chargeCycles}</p>
                                        <p><b className="font-semibold">Tình trạng:</b> {selectedItem.batteryDetail?.condition || "Chưa rõ"}</p>
                                        <p><b className="font-semibold">Ngày cập nhật:</b> {new Date(selectedItem.batteryDetail?.updatedAt).toLocaleString()}</p>
                                    </>
                                )}
                            </div>
                        </div>
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
