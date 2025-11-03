import React, { useState } from "react";
import { Form, Input, Button, Spin, Alert } from "antd";
import { MailOutlined, NumberOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import ForgotIllustration from "../assets/images/LoginPicture.jpg";

export default function ForgotPasswordPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [email, setEmail] = useState("");
    const [messageText, setMessageText] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const handleSendEmail = async (values) => {
        setLoading(true);
        setMessageText({ type: "", text: "" });
        try {
            const res = await fetch(`${baseURL}auth/password-resets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email }),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Không thể gửi email!");
            }
            setEmail(values.email);
            setCurrentStep(1);
            setMessageText({
                type: "success",
                text: "✅ Mã OTP đã được gửi đến email của bạn!",
            });
        } catch (err) {
            setMessageText({
                type: "error",
                text: err.message || "Đã xảy ra lỗi khi gửi email.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values) => {
        setMessageText({ type: "", text: "" });

        if (values.newPassword !== values.confirmPassword) {
            setMessageText({
                type: "error",
                text: "❌ Mật khẩu xác nhận không khớp!",
            });
            return;
        }

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
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Không thể đặt lại mật khẩu!");
            }
            setCurrentStep(2);
        } catch (err) {
            setMessageText({
                type: "error",
                text: err.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.",
            });
        } finally {
            setLoading(false);
        }
    };

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
                            { type: "email", message: "Địa chỉ email không hợp lệ!" },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                    </Form.Item>

                    {messageText.text && (
                        <Alert
                            className="mb-4"
                            type={messageText.type}
                            message={messageText.text}
                            showIcon
                        />
                    )}

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
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                            {
                                pattern:
                                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                                message:
                                    "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu mới"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu"
                        />
                    </Form.Item>

                    {messageText.text && (
                        <Alert
                            className="mb-4"
                            type={messageText.type}
                            message={messageText.text}
                            showIcon
                        />
                    )}

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

    const renderStepsBar = () => {
        const titles = ["Email", "OTP & Mật khẩu", "Hoàn tất"];
        return (
            <div className="flex items-center justify-center mb-6">
                {titles.map((title, index) => {
                    const isActive = index === currentStep;
                    const isDone = index < currentStep;

                    return (
                        <div key={index} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all duration-300 ${
                                    isActive
                                        ? "bg-[#D4AF37] text-white shadow-md"
                                        : isDone
                                        ? "bg-[#FFF8E7] border-2 border-[#D4AF37] text-[#D4AF37]"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {index + 1}
                            </div>

                            <span
                                className={`ml-2 text-sm font-medium ${
                                    isActive
                                        ? "text-gray-800"
                                        : isDone
                                        ? "text-[#D4AF37]"
                                        : "text-gray-400"
                                }`}
                            >
                                {title}
                            </span>

                            {index < titles.length - 1 && (
                                <div
                                    className={`w-10 h-[2px] mx-2 transition-all duration-300 ${
                                        isDone ? "bg-[#D4AF37]" : "bg-gray-200"
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
                {/* --- Form Column --- */}
                <div className="w-full lg:w-1/2 p-10">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Quên mật khẩu</h2>
                    <p className="text-gray-500 mb-6">
                        Đừng lo! Chúng tôi sẽ giúp bạn đặt lại mật khẩu chỉ trong vài bước.
                    </p>

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

                {/* --- Illustration Column --- */}
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
