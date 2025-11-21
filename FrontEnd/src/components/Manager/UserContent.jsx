import React, { useEffect, useState, useMemo, useCallback } from "react";
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
} from "antd";
import {
  MoreHorizontal,
  UserCheck,
  Ban,
  AlertTriangle,
  Search,
  Download,
} from "lucide-react";
import { managerAPI } from "../../hooks/managerApi";

const { Option } = Select;

export default function UserContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserId = useMemo(
    () => parseInt(localStorage.getItem("userId")),
    []
  );

  // ✅ Email sending function (silent fail if error)
  const sendBanEmail = useCallback(async (to, actionUrl, reason) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}mail/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, actionUrl, reason }),
      });

      if (!res.ok) {
        console.warn("Gửi mail thất bại:", res.status);
      }
    } catch (err) {
      console.warn("Lỗi khi gửi mail:", err);
    }
  }, []);

  // Fetch users with validation & caching control
  const fetchUsers = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await managerAPI.getUsersPaginated(pageNum, 20);
      const sortedUsers = (data.items || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setUsers(sortedUsers);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi tải user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  // Memoized filtering for performance
  const filteredUsers = useMemo(() => {
    if (!users.length) return [];

    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" || u.accountStatus === statusFilter;
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // ✅ Action handler with validation & no popups
  const handleStatusChange = useCallback(
    async (userId, status) => {
      if (!userId || userId === currentUserId) return;

      // Validation
      const validStatuses = ["Active", "Warning1", "Warning2", "Ban"];
      if (!validStatuses.includes(status)) return;

      const user = users.find((u) => u.userId === userId);
      if (!user) return;

      // Skip redundant status updates
      if (user.accountStatus === status) return;

      try {
        await managerAPI.updateUserStatus(userId, status);

        // Optimistic update
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === userId ? { ...u, accountStatus: status } : u
          )
        );

        // Silent email if banned
        if (status === "Ban" && user.email) {
          await sendBanEmail(
            user.email,
            "https://cocmuaxe.vn/help/appeal",
            "Tài khoản của bạn đã bị cấm do vi phạm điều khoản sử dụng."
          );
        }
      } catch (err) {
        console.error("Lỗi cập nhật:", err);
      }
    },
    [currentUserId, users, sendBanEmail]
  );

  // CSV export (no popup)
  const exportToCSV = useCallback(() => {
    if (!filteredUsers.length) return;

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

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredUsers]);

  const columns = useMemo(
    () => [
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
            role === "Buyer"
              ? "blue"
              : role === "Seller"
                ? "green"
                : role === "Staff"
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
            Active: { color: "green", text: "Đang hoạt động" },
            Warning1: { color: "orange", text: "Cảnh cáo 1" },
            Warning2: { color: "volcano", text: "Cảnh cáo 2" },
            Ban: { color: "red", text: "Bị cấm" },
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
                  key: "Warning1",
                  label: (
                    <div className="flex items-center gap-2 text-orange-500">
                      <AlertTriangle size={16} />
                      Cảnh cáo
                    </div>
                  ),
                },
                {
                  key: "Ban",
                  label: (
                    <div className="flex items-center gap-2 text-red-500">
                      <Ban size={16} />
                      Cấm tài khoản
                    </div>
                  ),
                },
                {
                  key: "Active",
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
    ],
    [currentUserId, handleStatusChange]
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      {/* Header + Filters */}
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
            <Option value="All">Tất cả vai trò</Option>
            <Option value="Buyer">Người mua</Option>
            <Option value="Seller">Người bán</Option>
            <Option value="Staff">Nhân viên</Option>
            <Option value="Manager">Quản lý</Option>
          </Select>

          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}>
            <Option value="All">Tất cả trạng thái</Option>
            <Option value="Active">Đang hoạt động</Option>
            <Option value="Warning1">Cảnh cáo 1</Option>
            <Option value="Warning2">Cảnh cáo 2</Option>
            <Option value="Ban">Bị cấm</Option>
          </Select>

          <Button type="default" icon={<Download size={16} />} onClick={exportToCSV}>
            Xuất CSV
          </Button>
        </Space>
      </div>

      <div className="text-sm text-slate-600 mb-3">
        Hiển thị <b>{filteredUsers.length}</b> người dùng
        {roleFilter !== "All" && ` (vai trò: ${roleFilter})`}
        {statusFilter !== "All" && `, trạng thái: ${statusFilter}`}
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
            onChange: setPage,
          }}
          bordered
          scroll={{ x: true }}
        />
      )}
    </div>
  );
}
