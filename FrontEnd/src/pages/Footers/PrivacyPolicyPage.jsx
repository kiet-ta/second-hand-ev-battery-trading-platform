import React from 'react';

const PolicySection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold font-roboto text-[#B8860B] mb-4">{title}</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
            {children}
        </div>
    </div>
);

function PrivacyPolicyPage() {
    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-roboto tracking-wider">Chính Sách Bảo Mật</h1>
                <p className="mt-4 text-lg text-gray-600">Cập nhật lần cuối: 22 tháng 10, 2025</p>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <PolicySection title="1. Thông Tin Chúng Tôi Thu Thập">
                    <p>Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như khi bạn tạo tài khoản, đặt hàng, hoặc liên hệ với bộ phận hỗ trợ khách hàng. Thông tin này có thể bao gồm tên, email, địa chỉ, số điện thoại và chi tiết thanh toán.</p>
                </PolicySection>
                <PolicySection title="2. Cách Chúng Tôi Sử Dụng Thông Tin">
                    <p>Thông tin của bạn được sử dụng để xử lý giao dịch, cung cấp dịch vụ khách hàng, cá nhân hóa trải nghiệm của bạn trên trang web, và gửi cho bạn các thông tin tiếp thị (nếu bạn chọn nhận). Chúng tôi cam kết không chia sẻ thông tin cá nhân của bạn với bên thứ ba không liên quan mà không có sự đồng ý của bạn.</p>
                </PolicySection>
                <PolicySection title="3. Bảo Mật Dữ Liệu">
                    <p>Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin của bạn khỏi mất mát, trộm cắp, lạm dụng và truy cập trái phép. Tuy nhiên, không có phương thức truyền tải qua Internet hoặc lưu trữ điện tử nào là an toàn 100%.</p>
                </PolicySection>
                 <PolicySection title="4. Quyền Của Bạn">
                    <p>Bạn có quyền truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình bất cứ lúc nào bằng cách đăng nhập vào tài khoản của bạn hoặc liên hệ với chúng tôi. Bạn cũng có thể từ chối nhận các email tiếp thị từ chúng tôi.</p>
                </PolicySection>
            </div>
        </div>
    );
}

export default PrivacyPolicyPage;
