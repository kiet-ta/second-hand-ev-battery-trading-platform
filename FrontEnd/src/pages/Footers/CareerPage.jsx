import React from 'react';
import { FiBriefcase, FiCoffee, FiCpu } from 'react-icons/fi';

const JobOpening = ({ title, location, type }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-[#E8E4DC] flex flex-col sm:flex-row justify-between items-center transition-all hover:shadow-lg hover:-translate-y-1">
        <div>
            <h3 className="text-xl font-bold text-[#2C2C2C]">{title}</h3>
            <p className="text-gray-500 mt-1">{location} &middot; {type}</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-[#D4AF37] text-[#2C2C2C] font-bold py-2 px-6 rounded-lg hover:bg-[#B8860B] transition-colors">
            Ứng Tuyển
        </button>
    </div>
);

function CareersPage() {
    const jobOpenings = [
        { title: "Chuyên Viên Kỹ Thuật Pin", location: "Dĩ An, Bình Dương", type: "Toàn thời gian" },
        { title: "Nhân Viên Kinh Doanh", location: "Quận 1, TP. HCM", type: "Toàn thời gian" },
        { title: "Chuyên Viên Marketing", location: "Làm việc từ xa", type: "Bán thời gian" },
    ];

    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            {/* Header */}
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-roboto tracking-wider">Cơ Hội Nghề Nghiệp</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Gia nhập đội ngũ tiên phong của chúng tôi và cùng định hình tương lai của ngành công nghiệp xe điện bền vững.
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Why Join Us */}
                <div className="mb-20">
                    <h2 className="text-4xl font-bold font-roboto text-center text-[#B8860B] mb-12">Tại Sao Chọn Chúng Tôi?</h2>
                    <div className="grid md:grid-cols-3 gap-10 text-center">
                        <div className="p-6">
                            <FiCpu className="w-12 h-12 text-[#B8860B] mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Dẫn Đầu Đổi Mới</h3>
                            <p className="text-gray-600">Làm việc với công nghệ mới nhất trong một ngành công nghiệp đang phát triển nhanh chóng.</p>
                        </div>
                        <div className="p-6">
                            <FiBriefcase className="w-12 h-12 text-[#B8860B] mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Phát Triển Sự Nghiệp</h3>
                            <p className="text-gray-600">Chúng tôi đầu tư vào sự phát triển của bạn với các cơ hội đào tạo và thăng tiến rõ ràng.</p>
                        </div>
                        <div className="p-6">
                            <FiCoffee className="w-12 h-12 text-[#B8860B] mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Văn Hóa Tuyệt Vời</h3>
                            <p className="text-gray-600">Một môi trường làm việc hợp tác, cởi mở và thân thiện, nơi mọi ý tưởng đều được lắng nghe.</p>
                        </div>
                    </div>
                </div>

                {/* Open Positions */}
                <div>
                    <h2 className="text-4xl font-bold font-roboto text-center text-[#B8860B] mb-12">Các Vị Trí Đang Tuyển</h2>
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {jobOpenings.map(job => (
                            <JobOpening key={job.title} {...job} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CareersPage;
