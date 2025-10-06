import { Eye, Edit, Trash2 } from "lucide-react";
import "../assets/styles/UsersTable.css"

const UsersTable = ({ users = [], onView, onEdit, onDelete }) => {
    if (!users || users.length === 0) {
        return (
            <div className="users-table-empty">
                <div className="empty-box">👥</div>
                <p>Không tìm thấy người dùng nào</p>
            </div>
        );
    }

    return (
        <div className="users-table-wrapper">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Liên hệ</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Xe đăng bán</th>
                        <th>Ngày tham gia</th>
                        <th className="text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            {/* Người dùng */}
                            <td>
                                <div className="user-info">
                                    <div className="avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="name">{user.name}</div>
                                        <div className="address">📍 {user.address}</div>
                                    </div>
                                </div>
                            </td>

                            {/* Liên hệ */}
                            <td>
                                <div className="email">{user.email}</div>
                                <div className="phone">{user.phone}</div>
                            </td>

                            {/* Vai trò */}
                            <td>
                                <span
                                    className={`role-badge ${user.role === "seller" ? "seller" : "buyer"
                                        }`}
                                >
                                    {user.role === "seller" ? "🏪 Người bán" : "🛒 Người mua"}
                                </span>
                            </td>

                            {/* Trạng thái */}
                            <td>
                                <span
                                    className={`status-badge ${user.status === "active" ? "active" : "inactive"
                                        }`}
                                >
                                    {user.status === "active" ? "✅ Hoạt động" : "❌ Không hoạt động"}
                                </span>
                            </td>

                            {/* Xe đăng bán */}
                            <td>
                                <span className="cars-posted">{user.carsPosted}</span>
                            </td>

                            {/* Ngày tham gia */}
                            <td>
                                {new Date(user.joinDate).toLocaleDateString("vi-VN")}
                            </td>

                            {/* Thao tác */}
                            <td className="actions">
                                <button
                                    onClick={() => onView(user)}
                                    title="Xem chi tiết"
                                    className="action-btn view"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => onEdit(user)}
                                    title="Chỉnh sửa"
                                    className="action-btn edit"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(user.id)}
                                    title="Xóa"
                                    className="action-btn delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;
