import { useNavigate } from "react-router-dom";

export default function BannedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Tài khoản của bạn đã bị khóa
                </h1>
                <p className="text-gray-600 mb-6">
                    Vui lòng liên hệ hỗ trợ nếu bạn cho rằng đây là nhầm lẫn.
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Đăng nhập tài khoản khác
                </button>
            </div>
        </div>
    );
}
