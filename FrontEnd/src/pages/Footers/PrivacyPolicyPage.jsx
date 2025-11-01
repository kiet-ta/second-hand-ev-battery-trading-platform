import React from 'react';

const PolicySection = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-2xl font-bold font-serif text-[#B8860B] mb-4">{title}</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </div>
);

function PrivacyPolicyPage() {
    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC] shadow-sm">
                <h1 className="text-5xl font-extrabold font-serif tracking-wider">Chính Sách Bảo Mật</h1>
                <p className="mt-4 text-lg text-gray-600">Cập nhật lần cuối: 28 tháng 10, 2025</p>
            </div>

            {/* Nội dung */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                <PolicySection title="1. Mục Đích Chính Sách Bảo Mật">
                    <p>
                        Chính sách này nhằm giải thích cách <strong>Cóc Mua Xe</strong> thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của người dùng khi bạn truy cập và sử dụng nền tảng của chúng tôi, bao gồm website, ứng dụng di động và các dịch vụ liên quan.
                    </p>
                    <p>
                        Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn theo quy định của pháp luật Việt Nam và các tiêu chuẩn bảo mật quốc tế.
                    </p>
                </PolicySection>

                <PolicySection title="2. Thông Tin Chúng Tôi Thu Thập">
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Thông tin cá nhân:</strong> họ tên, email, số điện thoại, giới tính, ngày sinh, địa chỉ, giấy tờ KYC (CCCD, GPLX,...).</li>
                        <li><strong>Thông tin tài khoản:</strong> tên đăng nhập, mật khẩu (được mã hoá), lịch sử hoạt động, đơn hàng, đấu giá, lịch sử thanh toán.</li>
                        <li><strong>Thông tin kỹ thuật:</strong> địa chỉ IP, loại thiết bị, trình duyệt, cookie, token đăng nhập.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="3. Cách Chúng Tôi Sử Dụng Thông Tin">
                    <ul className="list-decimal ml-6 space-y-2">
                        <li>Xử lý giao dịch, hỗ trợ khách hàng và xác minh danh tính.</li>
                        <li>Cải thiện trải nghiệm người dùng và gợi ý sản phẩm phù hợp.</li>
                        <li>Đảm bảo an toàn, ngăn chặn gian lận, bảo vệ quyền lợi người dùng.</li>
                        <li>Gửi thông báo, email xác nhận, hoặc thông tin marketing (khi bạn đồng ý).</li>
                        <li>Tuân thủ yêu cầu pháp lý từ cơ quan có thẩm quyền.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="4. Bảo Mật Dữ Liệu">
                    <p>
                        Chúng tôi áp dụng các biện pháp bảo mật như <strong>mã hóa dữ liệu (SHA-256, JWT)</strong>, <strong>chứng chỉ SSL/TLS</strong>, và hệ thống tường lửa nhằm đảm bảo thông tin của bạn luôn được an toàn.
                    </p>
                    <p>
                        Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ điện tử nào là an toàn tuyệt đối 100%. Chúng tôi khuyến nghị bạn bảo mật tài khoản và không chia sẻ thông tin đăng nhập với người khác.
                    </p>
                </PolicySection>

                <PolicySection title="5. Chia Sẻ Thông Tin">
                    <p>Chúng tôi không bán hoặc trao đổi thông tin cá nhân của người dùng cho bên thứ ba. Tuy nhiên, có thể chia sẻ trong các trường hợp:</p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li>Với đơn vị vận chuyển, đối tác thanh toán hoặc dịch vụ xác minh danh tính để phục vụ giao dịch.</li>
                        <li>Với cơ quan chức năng khi có yêu cầu hợp pháp.</li>
                        <li>Khi bạn đồng ý chia sẻ thông tin (ví dụ: liên kết mạng xã hội).</li>
                    </ul>
                </PolicySection>

                <PolicySection title="6. Quyền Của Người Dùng">
                    <ul className="list-disc ml-6 space-y-2">
                        <li>Truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào.</li>
                        <li>Tạm ngưng hoặc hủy tài khoản khi không còn nhu cầu sử dụng.</li>
                        <li>Yêu cầu ngừng nhận thông tin tiếp thị.</li>
                        <li>Gửi yêu cầu hoặc khiếu nại qua email: <strong>support@cocmuaxe.vn</strong>.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="7. Cookie Và Theo Dõi Hành Vi">
                    <p>
                        Chúng tôi sử dụng cookie để ghi nhớ thông tin đăng nhập, phân tích hành vi và tối ưu trải nghiệm người dùng. Bạn có thể tắt cookie trong trình duyệt, tuy nhiên một số tính năng có thể không hoạt động chính xác.
                    </p>
                </PolicySection>

                <PolicySection title="8. Liên Kết Đến Bên Thứ Ba">
                    <p>
                        Nền tảng Cóc Mua Xe có thể chứa liên kết đến các trang web khác (ngân hàng, đối tác vận chuyển, v.v.). Chúng tôi không chịu trách nhiệm về nội dung hoặc chính sách bảo mật của các website đó.
                    </p>
                </PolicySection>

                <PolicySection title="9. Thay Đổi Chính Sách">
                    <p>
                        Cóc Mua Xe có thể cập nhật Chính sách Bảo mật này theo định kỳ. Khi có thay đổi, chúng tôi sẽ thông báo trên website hoặc qua email. Phiên bản mới nhất luôn được đăng tại:
                        <br />
                        <a href="https://www.cocmuaxe.vn/privacy" className="text-[#B8860B] underline">
                            https://www.cocmuaxe.vn/privacy
                        </a>
                    </p>
                </PolicySection>

                <PolicySection title="10. Thông Tin Liên Hệ">
                    <p>
                        Nếu bạn có bất kỳ thắc mắc hoặc khiếu nại nào liên quan đến bảo mật thông tin, vui lòng liên hệ:
                    </p>
                    <ul className="list-none space-y-2">
                        <li><strong>Công ty TNHH Cóc Mua Xe Việt Nam</strong></li>
                        <li>Địa chỉ: [Cập nhật địa chỉ văn phòng]</li>
                        <li>Email: <a href="mailto:privacy@cocmuaxe.vn" className="text-[#B8860B]">cocmuaxecompany@gmail.com</a></li>
                        <li>Hotline: <strong>1900 88 68 68</strong></li>
                    </ul>
                </PolicySection>

                <div className="text-center pt-8 border-t border-[#E8E4DC]">
                    <p className="text-gray-600 italic">
                        Cóc Mua Xe cam kết bảo vệ tối đa quyền riêng tư của người dùng và xây dựng một nền tảng giao dịch xanh – an toàn – đáng tin cậy.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicyPage;
