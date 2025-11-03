import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Dropdown, Menu, Spin, message, Select, Space, Input } from "antd";
import { MoreHorizontal, UserCheck, Ban, AlertTriangle, Search, Download } from "lucide-react";
import { managerAPI } from "../../hooks/managerApi";

const { Option } = Select;

export default function UserContent() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const currentUserId = parseInt(localStorage.getItem("userId"));

    const sendBanEmail = async (to, actionUrl, reason) => {
        try {
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE_URL}mail/ban`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to,
                    actionUrl,
                    reason,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("❌ Gửi mail thất bại:", res.status, text);
                message.warning("Không thể gửi email thông báo cho người dùng");
            } else {
                message.success("📩 Đã gửi email thông báo cấm tài khoản!");
            }
        } catch (err) {
            console.error("❌ Lỗi khi gửi mail:", err);
            message.error("Lỗi khi gửi email thông báo");
        }
    };

    const fetchUsers = async (pageNum = 1) => {
        try {
            setLoading(true);
            const data = await managerAPI.getUsersPaginated(pageNum, 20);

            const sortedUsers = (data.items || []).sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            setUsers(sortedUsers);
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

    useEffect(() => {
        let filtered = [...users];

        if (roleFilter !== "all") filtered = filtered.filter((u) => u.role === roleFilter);
        if (statusFilter !== "all") filtered = filtered.filter((u) => u.accountStatus === statusFilter);
        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.fullName.toLowerCase().includes(q) ||
                    (u.email && u.email.toLowerCase().includes(q))
            );
        }

        setFilteredUsers(filtered);
    }, [users, roleFilter, statusFilter, searchQuery]);

    const handleStatusChange = async (userId, status) => {
        if (userId === currentUserId) {
            return;
        }

        try {
            await managerAPI.updateUserStatus(userId, status);
            await fetchUsers(page);

            if (status === "ban") {
                const bannedUser = users.find((u) => u.userId === userId);
                if (bannedUser && bannedUser.email) {
                    await sendBanEmail(
                        bannedUser.email,
                        "https://cocmuaxe.vn/help/appeal", 
                        "Tài khoản của bạn đã bị cấm do vi phạm điều khoản sử dụng."
                    );
                }
            }
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            message.error("❌ Cập nhật thất bại");
        }
    };


    const exportToCSV = () => {
        if (filteredUsers.length === 0) {
            message.info("Không có dữ liệu để xuất.");
            return;
        }

        const headers = ["ID", "Họ và tên", "Email", "Số điện thoại", "Vai trò", "Trạng thái"];
        const rows = filteredUsers.map((u) => [
            u.userId,
            u.fullName,
            u.email,
            u.phone,
            u.role,
            u.accountStatus,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            {/* Bộ lọc + tìm kiếm */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-semibold">👥 Danh sách người dùng</h2>

                <Space wrap>
                    <Input
                        prefix={<Search size={16} className="text-slate-400" />}
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        style={{ width: 220 }}
                    />

                    <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 160 }}>
                        <Option value="all">Tất cả vai trò</Option>
                        <Option value="buyer">Người mua</Option>
                        <Option value="seller">Người bán</Option>
                        <Option value="staff">Nhân viên</Option>
                        <Option value="manager">Quản lý</Option>
                    </Select>

                    <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}>
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="active">Đang hoạt động</Option>
                        <Option value="warning1">Cảnh cáo 1</Option>
                        <Option value="warning2">Cảnh cáo 2</Option>
                        <Option value="ban">Bị cấm</Option>
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

            {/* Đếm số lượng kết quả */}
            <div className="text-sm text-slate-600 mb-3">
                Hiển thị <b>{filteredUsers.length}</b> người dùng
                {roleFilter !== "all" && ` (vai trò: ${roleFilter})`}
                {statusFilter !== "all" && `, trạng thái: ${statusFilter}`}
                {searchQuery && `, tìm kiếm: “${searchQuery}”`}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="userId"
                    columns={columns}
                    dataSource={filteredUsers}
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
