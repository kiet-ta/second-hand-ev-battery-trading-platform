import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Dropdown,
    Menu,
    Spin,
    Tag,
    message,
    Input,
    Select,
    Space,
} from "antd";
import {
    MoreHorizontal,
    Check,
    XCircle,
    Search,
    Download,
    ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";
import { managerAPI } from "../../hooks/managerApi";
import Card from "../../components/Manager/Card";
import CardHeader from "../../components/Manager/CardHeader";

const { Option } = Select;

export default function SellerApprovalContent() {
    const [approvals, setApprovals] = useState([]);
    const [filteredApprovals, setFilteredApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // 📥 Lấy danh sách seller chờ duyệt
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

    // 🔎 Lọc và tìm kiếm
    useEffect(() => {
        let result = [...approvals];

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (a) =>
                    a.seller.toLowerCase().includes(q)
            );
        }

        setFilteredApprovals(result);
    }, [approvals, searchQuery]);

    // ⚙️ Duyệt / từ chối seller
    const handleAction = async (id, action) => {
        try {
            if (action === "approve") {
                await managerAPI.approveSeller(id);
                message.success("✅ Đã duyệt seller");
            } else {
                await managerAPI.rejectSeller(id);
                message.info("🚫 Đã từ chối seller");
            }
            await fetchApprovals();
        } catch (err) {
            console.error(err);
            message.error("❌ Xử lý thất bại");
        }
    };



    // 📋 Cấu hình bảng
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
            render: (text) => <span className="font-medium text-slate-800">{text}</span>,
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
                    title={` Seller Approvals Pending `}
                    icon={<ClipboardList size={18} />}
                />

                <div className="p-4">
                    {/* Bộ lọc và xuất CSV */}
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                        <Space wrap>
                            <Input
                                prefix={<Search size={16} className="text-slate-400" />}
                                placeholder="Tìm theo tên ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                                style={{ width: 240 }}
                            />

                        </Space>
                    </div>

                    {/* Đếm số lượng */}
                    <div className="text-sm text-slate-600 mb-3">
                        Hiển thị <b>{filteredApprovals.length}</b> yêu cầu chờ duyệt
                        {searchQuery && `, tìm kiếm: “${searchQuery}”`}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={filteredApprovals}
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
