import { Search } from 'lucide-react';
import "../assets/styles/SearchFilters.css"

const SearchFilters = ({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterRole,
    setFilterRole
}) => {
    return (
        <div className="search-filters">
            <div className="filters-row">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </select>

                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">Tất cả vai trò</option>
                    <option value="buyer">Người mua</option>
                    <option value="seller">Người bán</option>
                </select>
            </div>
        </div>
    );
};

export default SearchFilters;
