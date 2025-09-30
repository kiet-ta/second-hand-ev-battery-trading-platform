import StatsCard from "./StatsCard";
import SearchFilters from "./SearchFilters";
import UsersTable from "./UsersTable";
import "../assets/styles/UsersListView.css"

const UsersListView = ({
    users,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterRole,
    setFilterRole,
    handleCreateNew,
    handleView,
    handleEdit,
    handleDelete,
}) => {
    return (
        <div className="users-list-view">
            {/* Header */}
            <div className="header">
                <div>
                    <h1 className="users-list-view-title">Hi! ...</h1>
                    <p className="subtitle">Quản lý thông tin người dùng trong hệ thống</p>
                </div>
                <button onClick={handleCreateNew} className="-btn">
                    ➕ Thêm người dùng
                </button>
            </div>

            {/* Search & Filters */}
            <SearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterRole={filterRole} add
                setFilterRole={setFilterRole}
            />

            {/* Stats Cards (2x2 grid) */}
            <div className="stats-cards">
                <StatsCard
                    title="Tổng người dùng"
                    value={users.length}
                    icon={<span>👥</span>}
                    color="blue"
                />
                <StatsCard
                    title="Đang hoạt động"
                    value={users.filter((u) => u.status === "active").length}
                    icon={<span>✅</span>}
                    color="green"
                />
                <StatsCard
                    title="Người bán"
                    value={users.filter((u) => u.role === "seller").length}
                    icon={<span>🏪</span>}
                    color="purple"
                />
                <StatsCard
                    title="Người mua"
                    value={users.filter((u) => u.role === "buyer").length}
                    icon={<span>🛒</span>}
                    color="orange"
                />
            </div>

            {/* Users Table */}
            <UsersTable
                users={filteredUsers}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default UsersListView;
