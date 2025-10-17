const BASE = "https://localhost:7272/api";

export const managerAPI = {
    // ✅ Dashboard Metrics
    getMetrics: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/metrics`);
        if (!res.ok) throw new Error("Không thể tải metrics");
        return await res.json();
    },

    getRevenueByMonth: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/revenue-by-month`);
        if (!res.ok) throw new Error("Không thể tải revenue");
        return await res.json();
    },

    getOrdersByMonth: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/orders-by-month`);
        if (!res.ok) throw new Error("Không thể tải orders");
        return await res.json();
    },

    getProductDistribution: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/product-distribution`);
        if (!res.ok) throw new Error("Không thể tải distribution");
        return await res.json();
    },

    // ✅ Transactions – giao dịch mới nhất
    getTransactions: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/latest`);
        if (!res.ok) throw new Error("Không thể tải danh sách giao dịch mới nhất");
        return await res.json();
    },

    // ✅ Seller Approvals – danh sách seller chờ duyệt
    getPendingSellerApprovals: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/pending`);
        if (!res.ok) throw new Error("Không thể tải danh sách chờ duyệt");
        return await res.json();
    },

    // ✅ Seller Approvals – duyệt seller
    approveSeller: async (id) => {
        const res = await fetch(`${BASE}/ManagerDashboard/${id}/approve`, {
            method: "PATCH",
        });
        if (!res.ok) throw new Error("Không thể duyệt seller");
        return await res.json();
    },

    // ✅ Seller Approvals – từ chối seller
    rejectSeller: async (id) => {
        const res = await fetch(`${BASE}/ManagerDashboard/${id}/reject`, {
            method: "PATCH",
        });
        if (!res.ok) throw new Error("Không thể từ chối seller");
        return await res.json();
    },

    // ✅ Users & Products (giữ nguyên)
    getUsers: async () => {
        const res = await fetch(`${BASE}/User`);
        if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
        return res.json();
    },

    getProducts: async () => {
        const res = await fetch(`${BASE}/Item`);
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
        return res.json();
    },

    getItemWithSeller: async (itemId) => {
        const res = await fetch(`${BASE}/Item/${itemId}/Seller`);
        if (!res.ok) throw new Error(`Không thể tải sản phẩm ${itemId} cùng seller`);
        return res.json();
    },
};
