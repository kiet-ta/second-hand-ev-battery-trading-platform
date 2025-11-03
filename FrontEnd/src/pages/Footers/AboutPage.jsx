import React from 'react';

// Icons
const FiAward = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#B8860B]"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline></svg>;
const FiTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#B8860B]"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const FiUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#B8860B]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;


const TeamMemberCard = ({ image, name, role }) => (
    <div className="text-center">
        <img className="object-cover w-40 h-40 mx-auto rounded-full shadow-lg" src={image} alt={`${name}, ${role}`} />
        <div className="mt-4">
            <h4 className="text-xl font-bold text-[#2C2C2C]">{name}</h4>
            <p className="text-gray-600">{role}</p>
        </div>
    </div>
);

function AboutPage() {
    const teamMembers = [
        { name: "Nguyễn Văn A", role: "Nhà Sáng Lập & CEO", image: "https://placehold.co/400x400/E8E4DC/2C2C2C?text=A" },
        { name: "Trần Thị B", role: "Giám Đốc Vận Hành", image: "https://placehold.co/400x400/E8E4DC/2C2C2C?text=B" },
        { name: "Lê Văn C", role: "Trưởng Phòng Kỹ Thuật", image: "https://placehold.co/400x400/E8E4DC/2C2C2C?text=C" },
    ];

    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            {/* Hero Section */}
            <div className="relative h-96">
                <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop" alt="Xe điện cổ điển" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white font-roboto tracking-wider">Về Cóc Mua Xe</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Mission and Vision */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-4xl font-bold font-roboto text-[#B8860B] mb-4">Sứ Mệnh Của Chúng Tôi</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Tại Cóc Mua Xe, sứ mệnh của chúng tôi là thúc đẩy cuộc cách mạng xe điện bằng cách tạo ra một nền tảng đáng tin cậy, minh bạch và dễ dàng cho việc mua bán xe điện và pin đã qua sử dụng. Chúng tôi tin rằng một tương lai bền vững có thể đạt được bằng cách kéo dài vòng đời của các sản phẩm chất lượng.
                        </p>
                    </div>
                    <div className="p-8 bg-white rounded-lg shadow-lg border border-[#E8E4DC]">
                        <div className="flex items-center gap-6">
                            <FiTarget />
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Tầm Nhìn</h3>
                                <p className="text-gray-600">Trở thành điểm đến hàng đầu tại Việt Nam cho mọi nhu cầu về xe điện và pin đã qua sử dụng, được biết đến với chất lượng, sự chính trực và dịch vụ khách hàng vượt trội.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Values */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold font-roboto text-[#B8860B] mb-12">Giá Trị Cốt Lõi</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="p-6 bg-white rounded-lg shadow-lg border border-[#E8E4DC]">
                            <FiAward />
                            <h3 className="text-xl font-bold mt-4 mb-2">Chất Lượng</h3>
                            <p className="text-gray-600">Mỗi sản phẩm đều được kiểm tra kỹ lưỡng để đảm bảo hiệu suất và độ an toàn cao nhất.</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-lg border border-[#E8E4DC]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#B8860B] mx-auto"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            <h3 className="text-xl font-bold mt-4 mb-2">Minh Bạch</h3>
                            <p className="text-gray-600">Chúng tôi cung cấp thông tin rõ ràng và trung thực về tình trạng của mọi sản phẩm.</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-lg border border-[#E8E4DC]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#B8860B] mx-auto"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15.5" x2="9" y2="7"></line></svg>
                            <h3 className="text-xl font-bold mt-4 mb-2">Bền Vững</h3>
                            <p className="text-gray-600">Bằng cách tái sử dụng, chúng ta cùng nhau giảm thiểu rác thải điện tử và bảo vệ môi trường.</p>
                        </div>
                    </div>
                </div>


                {/* Team Section */}
                <div className="text-center">
                    <h2 className="text-4xl font-bold font-roboto text-[#B8860B] mb-12">Gặp Gỡ Đội Ngũ</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map(member => (
                            <TeamMemberCard key={member.name} {...member} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
