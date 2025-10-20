import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Dropdown, Menu, Spin, message } from "antd";
import { MoreHorizontal, UserCheck, Ban, AlertTriangle } from "lucide-react";
import { managerAPI } from "../../hooks/managerApi";

export default function UserContent() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const currentUserId = parseInt(localStorage.getItem("userId"));

    // 📥 Tải danh sách người dùng
    const fetchUsers = async (pageNum = 1) => {
        try {
            setLoading(true);
            const data = await managerAPI.getUsersPaginated(pageNum, 20);
            setUsers(data.items || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("❌ Lỗi tải user:", error);
            message.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    // ⚙️ Cập nhật trạng thái người dùng
    const handleStatusChange = async (userId, status) => {
        if (userId === currentUserId) {
            message.warning("⚠️ Bạn không thể thay đổi trạng thái của chính mình");
            return;
        }
        try {
            await managerAPI.updateUserStatus(userId, status);

            // Sau khi update thành công → gọi lại danh sách user
            await fetchUsers(page);

            message.success("✅ Trạng thái người dùng đã được cập nhật!");
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            message.error("❌ Cập nhật thất bại");
        }
    };


    const columns = [
        {
            title: "ID",
            dataIndex: "userId",
            key: "userId",
            width: 80,
            align: "center",
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 150,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const color =
                    role === "buyer"
                        ? "blue"
                        : role === "seller"
                            ? "green"
                            : role === "staff"
                                ? "orange"
                                : "purple";
                return <Tag color={color}>{role.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "accountStatus",
            key: "accountStatus",
            render: (status) => {
                const map = {
                    active: { color: "green", text: "Đang hoạt động" },
                    warning1: { color: "orange", text: "Cảnh cáo 1" },
                    warning2: { color: "volcano", text: "Cảnh cáo 2" },
                    ban: { color: "red", text: "Bị cấm" },
                };
                const info = map[status] || { color: "default", text: status };
                return <Tag color={info.color}>{info.text}</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "actions",
            align: "center",
            render: (_, record) => {
                if (record.userId === currentUserId)
                    return <Tag color="default">Chính bạn</Tag>;

                const menu = (
                    <Menu
                        onClick={({ key }) => handleStatusChange(record.userId, key)}
                        items={[
                            {
                                key: "warning1",
                                label: (
                                    <div className="flex items-center gap-2 text-orange-500">
                                        <AlertTriangle size={16} />
                                        Cảnh cáo
                                    </div>
                                ),
                            },
                            {
                                key: "ban",
                                label: (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <Ban size={16} />
                                        Cấm tài khoản
                                    </div>
                                ),
                            },
                            {
                                key: "active",
                                label: (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <UserCheck size={16} />
                                        Kích hoạt lại
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
            <h2 className="text-xl font-semibold mb-4">
                👥 Danh sách người dùng
            </h2>

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="userId"
                    columns={columns}
                    dataSource={users}
                    pagination={{
                        current: page,
                        total: totalPages * 20,
                        pageSize: 20,
                        onChange: (p) => setPage(p),
                    }}
                    bordered
                    scroll={{ x: true }}
                />
            )}
        </div>
    );
}
