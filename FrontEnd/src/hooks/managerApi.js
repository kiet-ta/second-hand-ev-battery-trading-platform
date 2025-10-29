const BASE = import.meta.env.VITE_API_BASE_URL;

export const managerAPI = {
    // Dashboard Metrics
    getMetrics: async () => {
        const res = await fetch(`${BASE}ManagerDashboard/metrics`);
        if (!res.ok) throw new Error("Không thể tải metrics");
        return await res.json();
    },

    getRevenueByMonth: async () => {
        const res = await fetch(`${BASE}ManagerDashboard/revenue-by-month`);
        if (!res.ok) throw new Error("Không thể tải revenue");
        return await res.json();
    },

    getOrdersByMonth: async () => {
        const res = await fetch(`${BASE}ManagerDashboard/orders-by-month`);
        if (!res.ok) throw new Error("Không thể tải orders");
        return await res.json();
    },

    getProductDistribution: async () => {
        const res = await fetch(`${BASE}ManagerDashboard/product-distribution`);
        if (!res.ok) throw new Error("Không thể tải distribution");
        return await res.json();
    },

    // Transactions – giao dịch mới nhất
    getTransactions: async () => {
        const res = await fetch(`${BASE}ManagerDashboard/latest`);
        if (!res.ok) throw new Error("Không thể tải danh sách giao dịch mới nhất");
        return await res.json();
    },

    // Seller Approvals – danh sách seller chờ duyệt
    getPendingSellerApprovals: async () => {
        const token = localStorage.getItem("token"); // 👈 thêm dòng này

        const res = await fetch(`${BASE}ManagerDashboard/pending`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // 👈 gửi kèm token như approveSeller
            },
        });

        if (!res.ok) throw new Error("Không thể tải danh sách chờ duyệt");
        return await res.json();
    },


    // Seller Approvals – duyệt seller
    approveSeller: async (id) => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE}ManagerDashboard/${id}/approve`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Không thể duyệt seller: ${errText}`);
        }

        return await res.json();
    },

    // Seller Approvals – từ chối seller
    rejectSeller: async (id) => {
        const res = await fetch(`${BASE}ManagerDashboard/${id}/reject`, {
            method: "PATCH",
        });
        if (!res.ok) throw new Error("Không thể từ chối seller");
        return await res.json();
    },

    // Users & Products (giữ nguyên)
    getUsers: async () => {
        const res = await fetch(`${BASE}User`);
        if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
        return res.json();
    },

    getProducts: async () => {
        const res = await fetch(`${BASE}Item`);
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
        return res.json();
    },

    getItemWithSeller: async (itemId) => {
        const res = await fetch(`${BASE}Item/${itemId}/Seller`);
        if (!res.ok) throw new Error(`Không thể tải sản phẩm ${itemId} cùng seller`);
        return res.json();
    },

    //set status người dùng
    updateUserStatus: async (userId, status) => {
        const token = localStorage.getItem("token");
        let url = "";

        // ánh xạ trạng thái sang API backend thực tế
        if (status === "ban") {
            url = `${BASE}KYC_Document/users/${userId}/ban`;
        } else if (status === "active") {
            url = `${BASE}KYC_Document/users/${userId}/activate`;
        } else if (status === "warning1" || status === "warning2") {
            url = `${BASE}KYC_Document/users/${userId}/warn`;
        } else {
            throw new Error("Invalid status type");
        }

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Cập nhật thất bại: ${err}`);
        }

        return await res.json();
    },
    getUsersPaginated: async (page = 1, pageSize = 20) => {
        const token = localStorage.getItem("token");
        const res = await fetch(
            `${BASE}User/all/user/pagination?page=${page}&pageSize=${pageSize}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) throw new Error("Không thể tải danh sách user");
        return await res.json();
    },

};
