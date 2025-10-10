
export const fakeManagerAPI = {
    getMetrics: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalUsers: 4512,
                    activeListings: 320,
                    revenueThisMonth: 1250000000,
                    complaintRate: 3.2,
                    growth: 12,
                });
            }, 500);
        }),

    getRevenueByMonth: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { month: "01", total: 210000000 },
                    { month: "02", total: 260000000 },
                    { month: "03", total: 290000000 },
                    { month: "04", total: 310000000 },
                    { month: "05", total: 340000000 },
                    { month: "06", total: 410000000 },
                    { month: "07", total: 380000000 },
                    { month: "08", total: 420000000 },
                    { month: "09", total: 460000000 },
                    { month: "10", total: 520000000 },
                ]);
            }, 600);
        }),

    getUsers: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: "Nguyễn Minh T.", role: "Buyer", status: "active", email: "minht@example.com" },
                    { id: 2, name: "Trần Lan A.", role: "Seller", status: "active", email: "lana@example.com" },
                    { id: 3, name: "Lê Huy N.", role: "Seller", status: "inactive", email: "huy.nguyen@example.com" },
                    { id: 4, name: "Phạm Thanh H.", role: "Staff", status: "active", email: "thanhh@example.com" },
                ]);
            }, 500);
        }),

    getProducts: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 201,
                        title: "YADEA G5 (2022)",
                        type: "EV",
                        price: 17500000,
                        seller: "NV Motors",
                        status: "active",
                        image: "https://img.yadea.com.vn/uploads/g5.jpg",
                    },
                    {
                        id: 202,
                        title: "VinFast Ludo (2021)",
                        type: "EV",
                        price: 9500000,
                        seller: "EcoWheels",
                        status: "sold",
                        image: "https://vinfastauto.com/sites/default/files/ludo.jpg",
                    },
                    {
                        id: 203,
                        title: "Lithium Battery 60V 20Ah",
                        type: "Battery",
                        price: 3200000,
                        seller: "GreenRide",
                        status: "active",
                        image:
                            "https://cdn.tgdd.vn/Files/2021/10/29/1397778/pin-xe-dien-60v20ah_800x450.jpg",
                    },
                    {
                        id: 204,
                        title: "YADEA Xmen (2019)",
                        type: "EV",
                        price: 6200000,
                        seller: "NV Motors",
                        status: "inactive",
                        image:
                            "https://cdn.tgdd.vn/Files/2020/12/24/1315801/yadea-xmen-1.jpg",
                    },
                ]);
            }, 500);
        }),


    getOrdersByMonth: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { month: "01", totalOrders: 120 },
                    { month: "02", totalOrders: 140 },
                    { month: "03", totalOrders: 160 },
                    { month: "04", totalOrders: 170 },
                    { month: "05", totalOrders: 190 },
                    { month: "06", totalOrders: 220 },
                    { month: "07", totalOrders: 210 },
                    { month: "08", totalOrders: 230 },
                    { month: "09", totalOrders: 260 },
                    { month: "10", totalOrders: 280 },
                ]);
            }, 600);
        }),

    getProductDistribution: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { name: "EV", value: 62 },
                    { name: "Battery", value: 38 },
                ]);
            }, 400);
        }),

    getSellerApprovals: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 101,
                        seller: "NV Motors",
                        region: "Hà Nội",
                        submittedAt: "2025-10-03",
                    },
                    {
                        id: 102,
                        seller: "GreenRide",
                        region: "HCM",
                        submittedAt: "2025-10-05",
                    },
                    {
                        id: 103,
                        seller: "EcoWheels",
                        region: "Đà Nẵng",
                        submittedAt: "2025-10-08",
                    },
                ]);
            }, 500);
        }),

    getDisputes: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 901,
                        orderCode: "ORD-2025-0001",
                        type: "Refund",
                        status: "pending",
                    },
                    {
                        id: 902,
                        orderCode: "ORD-2025-0021",
                        type: "Quality",
                        status: "pending",
                    },
                    {
                        id: 903,
                        orderCode: "ORD-2025-0035",
                        type: "Late Delivery",
                        status: "investigating",
                    },
                ]);
            }, 500);
        }),

    getTransactions: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: "T-1001",
                        item: "YADEA G5 (2022)",
                        buyer: "Minh T.",
                        seller: "NV Motors",
                        price: 17500000,
                        status: "completed",
                    },
                    {
                        id: "T-1002",
                        item: "VinFast Ludo (2021)",
                        buyer: "Lan A.",
                        seller: "EcoWheels",
                        price: 9500000,
                        status: "processing",
                    },
                    {
                        id: "T-1003",
                        item: "Lithium 60V 20Ah",
                        buyer: "Huy N.",
                        seller: "GreenRide",
                        price: 3200000,
                        status: "completed",
                    },
                    {
                        id: "T-1004",
                        item: "YADEA Xmen (2019)",
                        buyer: "Thảo P.",
                        seller: "NV Motors",
                        price: 6200000,
                        status: "cancelled",
                    },
                ]);
            }, 500);
        }),
};

