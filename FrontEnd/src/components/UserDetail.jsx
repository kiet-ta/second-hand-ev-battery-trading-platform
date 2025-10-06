import { Edit } from "lucide-react";
import "../assets/styles/UserDetail.css"

const UserDetail = ({ user, handleBack, handleEdit }) => {
    if (!user) {
        return (
            <div className="user-detail-empty">
                <p>Không tìm thấy thông tin người dùng</p>
                <button onClick={handleBack} className="btn back">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="user-detail">
            {/* Header */}
            <div className="detail-header">
                <h1>Chi tiết người dùng</h1>
                <div className="actions">
                    <button
                        onClick={() => handleEdit(user)}
                        className="btn edit"
                    >
                        <Edit size={18} />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={handleBack}
                        className="btn back"
                    >
                        Quay lại
                    </button>
                </div>
            </div>

            {/* Nội dung chi tiết */}
            <div className="detail-body">
                {/* Profile */}
                <div className="card profile-card">
                    <div className="avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h2>{user.name}</h2>
                    <p className="role">
                        {user.role === "seller" ? "🏪 Người bán" : "🛒 Người mua"}
                    </p>
                    <span
                        className={`status ${user.status === "active" ? "active" : "inactive"}`}
                    >
                        {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                </div>

                {/* Contact Info */}
                <div className="card contact-card">
                    <h3>Thông tin liên hệ</h3>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Điện thoại:</strong> {user.phone}</p>
                    <p><strong>Địa chỉ:</strong> {user.address}</p>
                    <p><strong>Ngày tham gia:</strong> {new Date(user.joinDate).toLocaleDateString("vi-VN")}</p>
                </div>

                {/* Statistics */}
                <div className="card stats-card">
                    <h3>Thống kê</h3>
                    <p><strong>Xe đã đăng bán:</strong> {user.carsPosted}</p>
                    <p><strong>Xe đã bán:</strong> 0</p>
                    <p><strong>Đánh giá:</strong> ⭐ 5.0</p>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
