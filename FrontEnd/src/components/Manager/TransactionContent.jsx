import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Table, Tag, Spin, message } from "antd";
import { ClipboardList } from "lucide-react";
import { managerAPI } from "../../hooks/managerApi";
import Card from "../../components/Manager/Card";
import CardHeader from "../../components/Manager/CardHeader";

function currencyVND(x) {
    try {
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}

export default function TransactionContent() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await managerAPI.getTransactions();
            setTransactions(data || []);
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
                    success: "green",
                    failed: "red",
                    refunded: "blue",
                };
                return (
                    <Tag color={colorMap[status] || "default"} className="capitalize">
                        {status}
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
                <CardHeader title="💰 Latest Transactions" icon={<ClipboardList size={18} />} />
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table
                            rowKey="paymentId"
                            columns={columns}
                            dataSource={transactions}
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
