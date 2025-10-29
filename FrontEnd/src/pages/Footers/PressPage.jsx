import React from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';

const PressRelease = ({ date, title, snippet }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-[#E8E4DC] transition-all hover:shadow-lg">
        <p className="text-sm text-gray-500 mb-2">{date}</p>
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">{title}</h3>
        <p className="text-gray-600">{snippet}</p>
        <a href="#" className="text-[#B8860B] font-semibold mt-4 inline-block hover:underline">Đọc thêm &rarr;</a>
    </div>
);

function PressPage() {
    const releases = [
        { date: "22 tháng 10, 2025", title: "Cóc Mua Xe Huy Động Thành Công 5 Triệu Đô Vòng Vốn Series A", snippet: "Khoản đầu tư sẽ được sử dụng để mở rộng quy mô hoạt động toàn quốc và phát triển công nghệ kiểm định pin độc quyền..." },
        { date: "15 tháng 9, 2025", title: "Ra Mắt Nền Tảng Giao Dịch Pin Xe Điện Đã Qua Sử Dụng Đầu Tiên tại Việt Nam", snippet: "Cóc Mua Xe chính thức giới thiệu thị trường thứ cấp cho pin xe điện, thúc đẩy nền kinh tế tuần hoàn..." },
    ];

    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-roboto tracking-wider">Thông Tin Báo Chí</h1>
                <p className="mt-4 text-lg text-gray-600">Tin tức, thông cáo và tài nguyên dành cho giới truyền thông.</p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Press Releases */}
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold font-roboto text-[#B8860B] mb-8">Thông Cáo Báo Chí</h2>
                        <div className="space-y-8">
                            {releases.map(release => (
                                <PressRelease key={release.title} {...release} />
                            ))}
                        </div>
                    </div>

                    {/* Media Contact */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#E8E4DC] sticky top-8">
                            <h3 className="text-2xl font-bold font-roboto mb-6">Liên Hệ Truyền Thông</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold font-roboto">Phòng Truyền Thông</h4>
                                    <p className="text-gray-600 font-roboto">Đối với các yêu cầu từ báo chí, vui lòng liên hệ:</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiMail className="w-5 h-5 text-[#B8860B]" />
                                    <a href="mailto:press@cocmuaxe.com" className="text-gray-700 hover:text-[#B8860B]">press@cocmuaxe.com</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiPhone className="w-5 h-5 text-[#B8860B]" />
                                    <a href="tel:+84123456789" className="text-gray-700 hover:text-[#B8860B]">(+84) 123 456 789</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PressPage;
