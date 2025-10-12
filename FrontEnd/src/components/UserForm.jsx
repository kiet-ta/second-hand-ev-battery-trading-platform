import "../index.css";
import "../assets/styles/UserForm.css";

const UserForm = ({
    formData,
    errors,
    updateFormData,
    handleSubmit,
    handleCancel,
    currentView,
}) => {
    return (
        <div className="user-form">
            <div className="form-header">
                <h1>{currentView === "create" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}</h1>
                <button onClick={handleCancel} className="cancel-btn">
                    Quay lại
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-body">
                {/* Họ và tên */}
                <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        className={errors.name ? "error" : ""}
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className={errors.email ? "error" : ""}
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className={errors.phone ? "error" : ""}
                    />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div className="form-group">
                    <label>Địa chỉ *</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateFormData("address", e.target.value)}
                        className={errors.address ? "error" : ""}
                    />
                    {errors.address && <p className="error-text">{errors.address}</p>}
                </div>

                {/* Role */}
                <div className="form-group">
                    <label>Vai trò</label>
                    <select
                        value={formData.role}
                        onChange={(e) => updateFormData("role", e.target.value)}
                    >
                        <option value="buyer">Người mua</option>
                        <option value="seller">Người bán</option>
                    </select>
                </div>

                {/* Status */}
                <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                        value={formData.status}
                        onChange={(e) => updateFormData("status", e.target.value)}
                    >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>

                {/* Buttons */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={handleCancel}   // ✅ nút Hủy gọi đúng hàm
                        className="btn cancel"
                    >
                        Hủy
                    </button>
                    <button type="submit" className="btn submit">
                        {currentView === "create" ? "Thêm người dùng" : "Cập nhật"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
