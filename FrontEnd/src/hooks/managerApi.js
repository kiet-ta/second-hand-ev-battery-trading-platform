const BASE = "https://localhost:7272/api";

export const managerAPI = {
    // ✅ Dashboard Metrics
    getMetrics: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/metrics`);
        if (!res.ok) throw new Error("Không thể tải metrics");
        return await res.json();
    },

    // ✅ Revenue by month
    getRevenueByMonth: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/revenue-by-month`);
        if (!res.ok) throw new Error("Không thể tải revenue");
        return await res.json();
    },

    // ✅ Orders by month
    getOrdersByMonth: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/orders-by-month`);
        if (!res.ok) throw new Error("Không thể tải orders");
        return await res.json();
    },

    // ✅ Product distribution
    getProductDistribution: async () => {
        const res = await fetch(`${BASE}/ManagerDashboard/product-distribution`);
        if (!res.ok) throw new Error("Không thể tải distribution");
        return await res.json();
    },

    // ⚙️ Fake tạm cho Seller Approvals (backend chưa có)
    getSellerApprovals: async () => {
        return [
            { id: 1, seller: "Lê Thị Hoa", region: "Hà Nội", submittedAt: "2025-10-10" },
            { id: 2, seller: "Trần Văn Hưng", region: "TP.HCM", submittedAt: "2025-10-12" },
        ];
    },

    // ⚙️ Fake tạm cho Disputes (nếu backend chưa làm)
    getDisputes: async () => {
        return [
            { id: 101, orderCode: "ORD-2025-001", type: "Refund", status: "pending" },
            { id: 102, orderCode: "ORD-2025-002", type: "Quality", status: "in_review" },
        ];
    },

    // ⚙️ Fake tạm cho Transactions (backend chưa có /api/Transactions/latest)
    getTransactions: async () => {
        return [
            {
                id: "TXN001",
                item: "Tesla Model 3",
                buyer: "Lê Thị Hồng",
                seller: "Nguyễn Văn An",
                price: 950000000,
                status: "completed",
            },
            {
                id: "TXN002",
                item: "BYD Atto 3",
                buyer: "Trần Hữu Dũng",
                seller: "Phạm Văn Hòa",
                price: 780000000,
                status: "processing",
            },
        ];
    },

    // ⚙️ Fake tạm cho Users
    getUsers: async () => {
        const res = await fetch(`${BASE}/User`);
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
    },

    getProducts: async () => {
        const res = await fetch(`${BASE}/Item`);
        if (!res.ok) throw new Error("Failed to fetch item list");
        return res.json();
    },

    getItemWithSeller: async (itemId) => {
        const res = await fetch(`${BASE}/Item/${itemId}/Seller`);
        if (!res.ok) throw new Error(`Failed to fetch item ${itemId} with seller`);
        return res.json();
    },
};
