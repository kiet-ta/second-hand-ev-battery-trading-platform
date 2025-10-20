import React, { useEffect, useState } from "react";
import { Table, Button, Dropdown, Menu, Spin, Tag, message } from "antd";
import { MoreHorizontal, Check, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { managerAPI } from "../../hooks/managerApi";
import Card from "../../components/Manager/Card";
import CardHeader from "../../components/Manager/CardHeader";

export default function SellerApprovalContent() {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApprovals = async () => {
        try {
            setLoading(true);
            const data = await managerAPI.getPendingSellerApprovals();
            setApprovals(data || []);
        } catch (err) {
            console.error("❌ Lỗi tải danh sách seller:", err);
            message.error("Không thể tải danh sách chờ duyệt");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (id, action) => {
        try {
            if (action === "approve") {
                await managerAPI.approveSeller(id);
                message.success("✅ Đã duyệt seller");
            } else {
                await managerAPI.rejectSeller(id);
                message.info("🚫 Đã từ chối seller");
            }
            await fetchApprovals(); // 🔁 refresh danh sách
        } catch (err) {
            console.error(err);
            message.error("❌ Xử lý thất bại");
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            align: "center",
            width: 80,
        },
        {
            title: "Người bán",
            dataIndex: "seller",
            key: "seller",
        },
        {
            title: "Khu vực",
            dataIndex: "region",
            key: "region",
        },
        {
            title: "Ngày gửi",
            dataIndex: "submittedAt",
            key: "submittedAt",
            render: (date) =>
                new Date(date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
        },
        {
            title: "Trạng thái",
            key: "status",
            align: "center",
            render: () => <Tag color="orange">Đang chờ duyệt</Tag>,
        },
        {
            title: "Hành động",
            key: "actions",
            align: "center",
            render: (_, record) => {
                const menu = (
                    <Menu
                        onClick={({ key }) => handleAction(record.id, key)}
                        items={[
                            {
                                key: "approve",
                                label: (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <Check size={16} />
                                        Duyệt
                                    </div>
                                ),
                            },
                            {
                                key: "reject",
                                label: (
                                    <div className="flex items-center gap-2 text-rose-600">
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
        <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader
                    title="📋 Seller Approvals Pending"
                    icon={<Check size={18} />}
                />
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={approvals}
                            bordered
                            pagination={false}
                        />
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
