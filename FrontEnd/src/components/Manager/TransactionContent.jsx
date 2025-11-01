import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Table, Tag, Spin, message, Input, Select, Space, Button } from "antd";
import { ClipboardList, Search, Download } from "lucide-react";
import { managerAPI } from "../../hooks/managerApi";
import Card from "../../components/Manager/Card";
import CardHeader from "../../components/Manager/CardHeader";

const { Option } = Select;

function currencyVND(x) {
    try {
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}

export default function TransactionContent() {
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // ✅ Tải dữ liệu giao dịch
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await managerAPI.getTransactions();

            // 🟢 Sắp xếp giao dịch mới nhất lên đầu (theo createdAt)
            const sorted = (data || []).sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            setTransactions(sorted);
        } catch (error) {
            console.error("❌ Lỗi tải giao dịch:", error);
            message.error("Không thể tải danh sách giao dịch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // ✅ Lọc và tìm kiếm
    useEffect(() => {
        let result = [...transactions];

        if (statusFilter !== "all") {
            result = result.filter((t) => t.status === statusFilter);
        }

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.buyerName?.toLowerCase().includes(q) ||
                    t.sellerName?.toLowerCase().includes(q) ||
                    t.items?.[0]?.title?.toLowerCase().includes(q)
            );
        }

        setFilteredData(result);
    }, [transactions, statusFilter, searchQuery]);

    // ✅ Xuất CSV
    const exportToCSV = () => {
        if (filteredData.length === 0) {
            message.info("Không có dữ liệu để xuất.");
            return;
        }

        const headers = [
            "Mã giao dịch",
            "Sản phẩm",
            "Người mua",
            "Người bán",
            "Giá trị (VND)",
            "Trạng thái",
            "Ngày giao dịch",
        ];

        const rows = filteredData.map((t) => [
            t.paymentId,
            t.items?.[0]?.title || "—",
            t.buyerName,
            t.sellerName,
            t.totalAmount,
            t.status,
            new Date(t.createdAt).toLocaleDateString("vi-VN"),
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `transactions_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: "Mã giao dịch",
            dataIndex: "paymentId",
            key: "paymentId",
            width: 120,
            render: (id) => <span className="font-medium">#{id}</span>,
        },
        {
            title: "Sản phẩm",
            dataIndex: "items",
            key: "item",
            render: (items) => items?.[0]?.title || "—",
        },
        {
            title: "Người mua",
            dataIndex: "buyerName",
            key: "buyerName",
        },
        {
            title: "Người bán",
            dataIndex: "sellerName",
            key: "sellerName",
        },
        {
            title: "Giá trị",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (value) => currencyVND(value),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) => {
                const colorMap = {
                    pending: "orange",
                    completed: "green",
                    failed: "red",
                    expired: "blue",
                };
                const labelMap = {
                    pending: "Đang chờ",
                    completed: "Thành công",
                    failed: "Thất bại",
                    expired: "Hết hạn",
                };
                return (
                    <Tag color={colorMap[status] || "default"}>
                        {labelMap[status] || status}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày giao dịch",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) =>
                new Date(date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
        },
    ];

    return (
        <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
        >
            <Card>
                <CardHeader
                    title="Quản lý giao dịch"
                    icon={<ClipboardList size={18} />}
                />
                <div className="p-4">
                    {/* Bộ lọc, tìm kiếm và xuất CSV */}
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                        <Space wrap>
                            <Input
                                prefix={<Search size={16} className="text-slate-400" />}
                                placeholder="Tìm theo tên người mua / bán / sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                                style={{ width: 260 }}
                            />

                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: 180 }}
                            >
                                <Option value="all">Tất cả trạng thái</Option>
                                <Option value="pending">Đang chờ</Option>
                                <Option value="completed">Thành công</Option>
                                <Option value="failed">Thất bại</Option>
                                <Option value="expired">Hết hạn</Option>
                            </Select>

                            <Button
                                type="default"
                                icon={<Download size={16} />}
                                onClick={exportToCSV}
                            >
                                Xuất CSV
                            </Button>
                        </Space>
                    </div>

                    {/* Thông tin thống kê */}
                    <div className="text-sm text-slate-600 mb-3">
                        Hiển thị <b>{filteredData.length}</b> giao dịch
                        {statusFilter !== "all" && ` (trạng thái: ${statusFilter})`}
                        {searchQuery && `, tìm kiếm: “${searchQuery}”`}
                    </div>

                    {/* Bảng dữ liệu */}
                    {loading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table
                            rowKey="paymentId"
                            columns={columns}
                            dataSource={filteredData}
                            bordered
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: true }}
                        />
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
