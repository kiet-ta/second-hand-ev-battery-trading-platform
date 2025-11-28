
import React, { useEffect, useState } from "react";
import { Table, Tag, Input, Select, Spin, Empty } from "antd";
import paymentApi from "../../api/paymentApi";

const { Search } = Input;
const { Option } = Select;

export default function TransactionHistory() {
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    //  STATUS & TYPE MAPPING (ĐÚNG THEO SQL)
    const statusColors = {
        Pending: "gold",
        Completed: "green",
        Failed: "red",
        Refunded: "blue",
        Expired: "gray",
    };

    const statusText = {
        Pending: "Đang xử lý",
        Completed: "Thành công",
        Failed: "Thất bại",
        Refunded: "Đã hoàn tiền",
        Expired: "Hết hạn",
    };

    const paymentTypeText = {
        "Seller-Registration": "Đăng ký Seller",
        Deposit: "Nạp tiền vào ví",
        Order_Purchase: "Mua sản phẩm",
        Order_Revenue: "Bán sản phẩm",
    };

    const paymentTypeColors = {
        "Seller-Registration": "purple",
        Deposit: "blue",
        Order_Purchase: "orange",
        Order_Revenue: "orange",
    };

    const paymentMethodText = {
        PayOS: "Thanh toán PayOS",
        Wallet: "Thanh toán bằng Ví",
    };

    const paymentMethodColors = {
        PayOS: "blue",
        Wallet: "green",
    };

    //  FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await paymentApi.getHistoryByUser(userId, token);
                setData(res.data);
                setFiltered(res.data);
            } catch (err) {
                console.error("Lỗi khi tải lịch sử thanh toán:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    //  FILTER STATUS
    const handleFilterStatus = (value) => {
        setStatusFilter(value);
        filterTransactions(value, typeFilter);
    };

    //  FILTER TYPE
    const handleFilterType = (value) => {
        setTypeFilter(value);
        filterTransactions(statusFilter, value);
    };

    const filterTransactions = (status, type) => {
        let result = data;
        if (status !== "all") result = result.filter((t) => t.status.toLowerCase() === status);
        if (type !== "all") result = result.filter((t) => t.paymentType === type);
        setFiltered(result);
    };

    // LOADING UI
    if (loading)
        return (
            <div className="text-center mt-20">
                <Spin size="large" />
            </div>
        );

    if (data.length === 0)
        return (
            <div className="text-center mt-20">
                <Empty description="Chưa có giao dịch nào!" />
            </div>
        );

    const getSign = (type) => {
        if (type === "Deposit") return "+";
        if (type === "Order_Revenue") return "+"
        return "-";
    };

    //  CẤU HÌNH TABLE
    const columns = [
        { title: "Mã đơn hàng", dataIndex: "orderCode", key: "orderCode" },

        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (value, record) => {
                const sign = getSign(record.paymentType);
                const color = sign === "+" ? "green" : "red";

                return (
                    <span style={{ color, fontWeight: "bold" }}>
                        {sign} {value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </span>
                );
            },
        },


        {
            title: "Phương thức",
            dataIndex: "method",
            key: "method",
            render: (value) => (
                <Tag color={paymentMethodColors[value] || "default"}>
                    {paymentMethodText[value] || value || "Không rõ"}
                </Tag>
            ),
        },

        {
            title: "Loại thanh toán",
            dataIndex: "paymentType",
            key: "paymentType",
            render: (value) => (
                <Tag color={paymentTypeColors[value] || "default"}>
                    {paymentTypeText[value] || value}
                </Tag>
            ),
        },

        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value) => {
                const key = value; // BE trả PascalCase, FE mapping lowercase
                return <Tag color={statusColors[key]}>{statusText[key]}</Tag>;
            },
        },

        {
            title: "Thời gian tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v) =>
                new Date(v).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
        },
    ];

    return (
        <div className="p-4">

            {/* BỘ LỌC */}
            <div className="flex gap-4 mb-4">


                <Select value={statusFilter} onChange={handleFilterStatus} style={{ width: 180 }}>
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="Pending">Đang xử lý</Option>
                    <Option value="Completed">Thành công</Option>
                    <Option value="Failed">Thất bại</Option>
                    <Option value="Refunded">Đã hoàn tiền</Option>
                    <Option value="Expired">Hết hạn</Option>
                </Select>

                <Select value={typeFilter} onChange={handleFilterType} style={{ width: 220 }}>
                    <Option value="all">Tất cả loại thanh toán</Option>
                    <Option value="Seller-Registration">Đăng ký Seller</Option>
                    <Option value="Deposit">Nạp tiền vào ví</Option>
                    <Option value="Order_Purchase">Mua sản phẩm</Option>
                </Select>
            </div>

            <Table columns={columns} dataSource={filtered} rowKey="paymentId" />
        </div>
    );
}
