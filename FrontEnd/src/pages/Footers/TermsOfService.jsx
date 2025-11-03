import React from 'react';

const PolicySection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold font-roboto text-[#B8860B] mb-4">{title}</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
            {children}
        </div>
    </div>
);

function TermsOfServicePage() {
    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-roboto tracking-wider">Điều Khoản Dịch Vụ</h1>
                <p className="mt-4 text-lg text-gray-600">Cập nhật lần cuối: 22 tháng 10, 2025</p>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <PolicySection title="1. Chấp Thuận Điều Khoản">
                    <p>Bằng cách truy cập và sử dụng trang web Cóc Mua Xe, bạn đồng ý tuân thủ các Điều Khoản Dịch Vụ này và tất cả các luật và quy định hiện hành. Nếu bạn không đồng ý, vui lòng không sử dụng trang web.</p>
                </PolicySection>
                <PolicySection title="2. Trách Nhiệm Của Người Dùng">
                    <p>Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình. Bạn đồng ý không sử dụng trang web cho bất kỳ mục đích bất hợp pháp hoặc bị cấm nào.</p>
                </PolicySection>
                <PolicySection title="3. Giới Hạn Trách Nhiệm">
                    <p>Cóc Mua Xe không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc do hậu quả nào phát sinh từ việc bạn sử dụng trang web hoặc các sản phẩm được mua từ trang web.</p>
                </PolicySection>
            </div>
        </div>
    );
}

export default TermsOfServicePage;
