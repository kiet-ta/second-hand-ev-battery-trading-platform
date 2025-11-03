import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Space, Spin, Popconfirm } from "antd";
import { RefreshCcw, Power } from "lucide-react";

export default function CommissionSettings() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("token");

    // Fetch all commission rules
    const fetchRules = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}commission/rules`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setRules(data);
        } catch (err) {
            console.error("❌ Error loading rules:", err);
            message.error("Không thể tải danh sách quy định hoa hồng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    // Toggle active status
    const handleToggle = async (record) => {
        try {
            const payload = {
                rule: {
                    ruleId: record.ruleId,
                    feeCode: record.feeCode,
                    feeName: record.feeName,
                    targetRole: record.targetRole,
                    feeType: record.feeType,
                    feeValue: record.feeValue,
                    effectiveFrom: record.effectiveFrom,
                    effectiveTo: record.effectiveTo,
                    isActive: record.isActive, 
                    createdAt: record.createdAt,
                },
            };
            console.log(payload)
            const res = await fetch(`${BASE_URL}commission/${record.feeCode}/toggle`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload.rule),
            });

            if (!res.ok) throw new Error(await res.text());
            message.success("Đã thay đổi trạng thái hiệu lực!");
            fetchRules();
        } catch (err) {
            console.error("❌ Toggle error:", err);
            message.error("Không thể thay đổi trạng thái!");
        }
    };
    // Columns
    const columns = [
        {
            title: "Mã phí",
            dataIndex: "feeCode",
            key: "feeCode",
            width: 100,
        },
        {
            title: "Tên quy định",
            dataIndex: "feeName",
            key: "feeName",
        },
        {
            title: "Đối tượng",
            dataIndex: "targetRole",
            key: "targetRole",
            render: (role) => {
                const color =
                    role === "seller" ? "purple" : role === "buyer" ? "blue" : "cyan";
                return <Tag color={color}>{role.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Loại phí",
            dataIndex: "feeType",
            key: "feeType",
            render: (type) => (
                <Tag color={type === "percentage" ? "green" : "orange"}>
                    {type === "percentage" ? "Phần trăm (%)" : "Cố định (VND)"}
                </Tag>
            ),
        },
        {
            title: "Giá trị",
            dataIndex: "feeValue",
            key: "feeValue",
            render: (v, r) =>
                r.feeType === "percentage" ? `${v}%` : v.toLocaleString("vi-VN") + "₫",
        },
        {
            title: "Hiệu lực",
            dataIndex: "isActive",
            key: "isActive",
            render: (active) => (
                <Tag color={active ? "green" : "volcano"}>
                    {active ? "Đang áp dụng" : "Ngưng"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Popconfirm
                    title={`Bạn có chắc muốn ${record.isActive ? "ngưng" : "bật"} quy định này?`}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={() => handleToggle(record)}
                >
                    <Button
                        icon={<Power size={16} />}
                        danger={record.isActive}
                        type={record.isActive ? "default" : "primary"}
                    >
                        {record.isActive ? "Tắt hiệu lực" : "Bật hiệu lực"}
                    </Button>
                </Popconfirm>),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    ⚙️ Quản lý quy định & phí hoa hồng
                </h2>
                <Button icon={<RefreshCcw size={16} />} onClick={fetchRules}>
                    Làm mới
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="ruleId"
                    columns={columns}
                    dataSource={rules}
                    pagination={{ pageSize: 8 }}
                />
            )}
        </div>
    );
}
