import React, { useState } from "react";
import { Form, Input, Button, Spin, message } from "antd";
import { MailOutlined, NumberOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import ForgotIllustration from "../assets/images/LoginPicture.jpg";

export default function ForgotPasswordPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // --- Gửi OTP ---
    const handleSendEmail = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseURL}auth/password-resets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email }),
            });
            if (!res.ok) throw new Error(await res.text() || "Không thể gửi email!");
            message.success("✅ OTP đã được gửi đến email của bạn!");
            setEmail(values.email);
            setCurrentStep(1);
        } catch (err) {
            message.error(err.message || "Gửi OTP thất bại.");
        } finally {
            setLoading(false);
        }
    };

    // --- Đặt lại mật khẩu ---
    const handleResetPassword = async (values) => {
        if (values.newPassword !== values.confirmPassword)
            return message.error("❌ Mật khẩu xác nhận không khớp!");
        setLoading(true);
        try {
            const res = await fetch(`${baseURL}auth/password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otpCode: values.otpCode,
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword,
                }),
            });
            if (!res.ok) throw new Error(await res.text() || "Không thể đặt lại mật khẩu!");
            message.success("✅ Đặt lại mật khẩu thành công!");
            setCurrentStep(2);
        } catch (err) {
            message.error(err.message || "Đặt lại mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    // --- Nội dung các bước ---
    const steps = [
        {
            title: "Email",
            content: (
                <Form form={form} onFinish={handleSendEmail} layout="vertical">
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        className="bg-[#D4AF37] hover:bg-[#C19A32] border-none"
                    >
                        Gửi mã OTP
                    </Button>
                </Form>
            ),
        },
        {
            title: "OTP & Mật khẩu",
            content: (
                <Form form={form} onFinish={handleResetPassword} layout="vertical">
                    <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-600 mb-4">
                        Gửi OTP tới: <span className="font-medium">{email}</span>{" "}
                        <Button
                            size="small"
                            type="link"
                            onClick={() => setCurrentStep(0)}
                            className="!text-[#D4AF37] p-0"
                        >
                            đổi email
                        </Button>
                    </div>

                    <Form.Item
                        name="otpCode"
                        label="Mã OTP"
                        rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
                    >
                        <Input prefix={<NumberOutlined />} placeholder="Nhập mã OTP" />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        className="bg-[#D4AF37] hover:bg-[#C19A32] border-none"
                    >
                        Đặt lại mật khẩu
                    </Button>

                    <div className="text-center mt-3">
                        <Button
                            type="link"
                            className="!text-[#D4AF37] p-0"
                            onClick={() => handleSendEmail({ email })}
                        >
                            Gửi lại OTP
                        </Button>
                    </div>
                </Form>
            ),
        },
        {
            title: "Hoàn tất",
            content: (
                <div className="text-center">
                    <p className="text-green-600 font-semibold text-lg mb-2">
                        ✅ Mật khẩu đã được đặt lại thành công!
                    </p>
                    <Button
                        type="primary"
                        onClick={() => navigate("/login")}
                        className="bg-[#D4AF37] hover:bg-[#C19A32] border-none"
                    >
                        Quay lại đăng nhập
                    </Button>
                </div>
            ),
        },
    ];

    // --- Thanh hiển thị tiến trình (tailwind thuần) ---
    const renderStepsBar = () => {
        const titles = ["Email", "OTP & Mật khẩu", "Hoàn tất"];
        return (
            <div className="flex items-center justify-center mb-6">
                {titles.map((title, index) => {
                    const isActive = index === currentStep;
                    const isDone = index < currentStep;

                    return (
                        <div key={index} className="flex items-center">
                            {/* Vòng tròn số */}
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all duration-300 ${isActive
                                    ? "bg-[#D4AF37] text-white shadow-md"
                                    : isDone
                                        ? "bg-[#FFF8E7] border-2 border-[#D4AF37] text-[#D4AF37]"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {index + 1}
                            </div>

                            {/* Tên bước */}
                            <span
                                className={`ml-2 text-sm font-medium ${isActive
                                    ? "text-gray-800"
                                    : isDone
                                        ? "text-[#D4AF37]"
                                        : "text-gray-400"
                                    }`}
                            >
                                {title}
                            </span>

                            {/* Đường nối */}
                            {index < titles.length - 1 && (
                                <div
                                    className={`w-10 h-[2px] mx-2 transition-all duration-300 ${isDone ? "bg-[#D4AF37]" : "bg-gray-200"
                                        }`}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8E7] px-4">
            <div className="relative bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row items-center justify-between w-full max-w-4xl overflow-hidden">
                {/* --- Cột Form --- */}
                <div className="w-full lg:w-1/2 p-10">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Quên mật khẩu</h2>
                    <p className="text-gray-500 mb-6">
                        Đừng lo! Chúng tôi sẽ giúp bạn đặt lại mật khẩu chỉ trong vài bước.
                    </p>

                    {/* Steps tự làm bằng Tailwind */}
                    {renderStepsBar()}

                    <Spin spinning={loading}>{steps[currentStep].content}</Spin>

                    {currentStep < 2 && (
                        <p className="text-sm text-gray-600 mt-6 text-center">
                            Nhớ mật khẩu rồi?{" "}
                            <Link
                                to="/login"
                                className="!text-[#D4AF37] hover:underline font-medium"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </p>
                    )}
                </div>

                {/* --- Cột hình minh họa --- */}
                <div className="relative w-full lg:w-1/2 flex items-center justify-center bg-white">
                    <img
                        src={ForgotIllustration}
                        alt="Hình minh họa quên mật khẩu"
                        className="w-[360px] h-auto object-contain drop-shadow-md mix-blend-multiply"
                    />
                </div>
            </div>
        </div>
    );
}
