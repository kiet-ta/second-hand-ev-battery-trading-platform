import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Modal, Form, Input, Select, InputNumber, Switch, message, Space, Spin } from "antd";
import { Plus, Edit3, RefreshCcw } from "lucide-react";
import { managerAPI } from "../../hooks/managerApi";

const { Option } = Select;

export default function CommissionSettings() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [form] = Form.useForm();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("token");

    // Lấy danh sách quy định hoa hồng
    const fetchRules = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}commission/rules`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setRules(data);
        } catch (err) {
            console.error("❌ Lỗi tải danh sách:", err);
            message.error("Không thể tải danh sách quy định hoa hồng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    // Gửi dữ liệu thêm/sửa
    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                feeValue: parseFloat(values.feeValue),
                isActive: values.isActive ?? true,
                effectiveFrom: new Date().toISOString(),
            };

            const res = await fetch(`${BASE_URL}commission/rules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(await res.text());
            message.success(editingRule ? "Đã cập nhật quy định!" : "Đã thêm quy định mới!");
            setOpenModal(false);
            form.resetFields();
            fetchRules();
        } catch (err) {
            console.error("❌ Lỗi gửi dữ liệu:", err);
            message.error("Cập nhật thất bại!");
        }
    };

    // Bảng hiển thị quy định
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
                <Button
                    icon={<Edit3 size={16} />}
                    type="text"
                    onClick={() => {
                        setEditingRule(record);
                        setOpenModal(true);
                        form.setFieldsValue(record);
                    }}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">⚙️ Cập nhật quy định & phí hoa hồng</h2>
                <Space>
                    <Button
                        icon={<RefreshCcw size={16} />}
                        onClick={fetchRules}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        onClick={() => {
                            setEditingRule(null);
                            form.resetFields();
                            setOpenModal(true);
                        }}
                    >
                        Thêm quy định mới
                    </Button>
                </Space>
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

            {/* Modal thêm/sửa */}
            <Modal
                title={editingRule ? "Chỉnh sửa quy định" : "Thêm quy định mới"}
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onOk={() => form.submit()}
                okText={editingRule ? "Cập nhật" : "Thêm mới"}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Mã phí (Fee Code)"
                        name="feeCode"
                        rules={[{ required: true, message: "Vui lòng nhập mã phí" }]}
                    >
                        <Input placeholder="VD: FEE011" />
                    </Form.Item>

                    <Form.Item
                        label="Tên quy định"
                        name="feeName"
                        rules={[{ required: true, message: "Vui lòng nhập tên quy định" }]}
                    >
                        <Input placeholder="VD: Premium Promotion Fee" />
                    </Form.Item>

                    <Form.Item
                        label="Đối tượng áp dụng"
                        name="targetRole"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Chọn vai trò">
                            <Option value="seller">Người bán</Option>
                            <Option value="buyer">Người mua</Option>
                            <Option value="all">Tất cả</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Loại phí"
                        name="feeType"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="percentage">Phần trăm (%)</Option>
                            <Option value="fixed">Cố định (VND)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Giá trị phí"
                        name="feeValue"
                        rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(v) => (form.getFieldValue("feeType") === "percentage" ? `${v}%` : `${v}₫`)}
                        />
                    </Form.Item>

                    <Form.Item label="Hiệu lực" name="isActive" valuePropName="checked">
                        <Switch checkedChildren="Đang áp dụng" unCheckedChildren="Ngưng" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
