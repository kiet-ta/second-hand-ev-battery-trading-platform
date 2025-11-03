import React, { useState, useEffect } from "react";
import { message, InputNumber, Button, Card, Spin } from "antd";
import { ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function RechargePage() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem("userId");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchWallet = async () => {
        try {
            const res = await fetch(`${BASE_URL}wallet/user/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            setBalance(data.balance || 0);
        } catch (err) {
            message.error("Không thể tải số dư ví!");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const handlePayment = async () => {
        if (amount <= 0) {
            message.warning("Vui lòng nhập số tiền hợp lệ!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}payment/initiate-deposit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ amount }),
            });

            const data = await res.json();

            if (res.ok && data.checkoutUrl) {
                message.success("Chuyển hướng đến trang thanh toán...");
                window.open(data.checkoutUrl, "_blank");
            } else {
                message.error(data.message || "Không thể khởi tạo thanh toán!");
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi khởi tạo thanh toán!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFDF5] to-[#FFF8E5] flex flex-col items-center py-10 px-4">
            {/* Header */}
            <div className="flex items-center gap-3 w-full max-w-2xl mb-8">
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-[#B8860B]"
                >
                    Quay lại
                </Button>
                <h1 className="text-3xl font-extrabold text-[#B8860B] tracking-wide drop-shadow-sm">
                    Nạp tiền vào ví
                </h1>
            </div>

            {/* Wallet card */}
            <Card
                className="max-w-2xl w-full shadow-lg border-none rounded-2xl bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
                bodyStyle={{ padding: "2.5rem" }}
            >
                {fetching ? (
                    <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-center">
                            <p className="text-gray-500 text-lg">Số dư hiện tại</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <DollarOutlined className="text-[#FFD700] text-xl" />
                                <p className="text-4xl font-extrabold text-[#C89B0D]">
                                    {balance.toLocaleString()} ₫
                                </p>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="mb-5">
                            <p className="text-gray-700 font-medium mb-2">
                                Nhập số tiền muốn nạp:
                            </p>
                            <InputNumber
                                value={amount}
                                onChange={setAmount}
                                min={10000}
                                step={50000}
                                style={{
                                    width: "100%",
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                    fontSize: "1rem",
                                }}
                                className="shadow-inner"
                                formatter={(value) =>
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                                parser={(value) => value.replace(/,/g, "")}
                                placeholder="Nhập số tiền (₫)"
                            />
                        </div>

                        {/* Quick select buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {[100000, 500000, 1000000, 5000000].map((value) => (
                                <Button
                                    key={value}
                                    type={amount === value ? "primary" : "default"}
                                    onClick={() => setAmount(value)}
                                    className={`py-2 font-medium rounded-lg ${amount === value
                                        ? "bg-[#FFD700] border-none text-black"
                                        : "hover:border-[#FFD700]"
                                        }`}
                                >
                                    {value.toLocaleString()} ₫
                                </Button>
                            ))}
                        </div>

                        {/* Confirm button */}
                        <div className="mt-8 text-center">
                            <Button
                                type="primary"
                                size="large"
                                loading={loading}
                                className="bg-[#4F39F6] hover:bg-[#3C29D0] text-white font-semibold rounded-xl px-8 shadow-md transition-all"
                                onClick={handlePayment}
                            >
                                Thanh toán QR
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
