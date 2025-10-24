import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

const BlogPostCard = ({ image, category, title, snippet }) => (
    <a href="#" className="block group">
        <div className="overflow-hidden rounded-lg shadow-lg border border-[#E8E4DC] bg-white h-full flex flex-col">
            <img src={image} alt={title} className="w-full h-48 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm font-semibold text-[#B8860B] uppercase">{category}</p>
                <h3 className="mt-2 text-xl font-bold text-[#2C2C2C] flex-grow">{title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{snippet}</p>
                <div className="mt-4 text-sm font-semibold text-[#B8860B] group-hover:underline flex items-center">
                    Đọc thêm <FiArrowRight className="ml-1 w-4 h-4" />
                </div>
            </div>
        </div>
    </a>
);

function BlogPage() {
    const posts = [
        { category: "Mẹo & Thủ Thuật", title: "5 Cách Tối Ưu Tuổi Thọ Pin Xe Điện Của Bạn", snippet: "Khám phá các phương pháp tốt nhất để bảo dưỡng pin và kéo dài tuổi thọ...", image: "https://images.unsplash.com/photo-1617886322207-6f504e7472c5?q=80&w=2070&auto=format&fit=crop" },
        { category: "Tin Tức Ngành", title: "Tương Lai Của Xe Điện Tự Lái Tại Việt Nam", snippet: "Phân tích các xu hướng và thách thức đối với công nghệ xe tự lái...", image: "https://images.unsplash.com/photo-1551830820-330a71b99659?q=80&w=2070&auto=format&fit=crop" },
        { category: "So Sánh", title: "Chọn Xe Điện Cũ: Cần Lưu Ý Những Gì?", snippet: "Hướng dẫn toàn diện về những điểm cần kiểm tra khi mua một chiếc xe điện đã qua sử dụng...", image: "https://images.unsplash.com/photo-1621287038622-8e4a7a1308a7?q=80&w=2070&auto=format&fit=crop" },
    ];
    
    return (
         <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-serif tracking-wider">Blog & Tin Tức</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Cập nhật những thông tin, xu hướng và kiến thức mới nhất về thế giới xe điện.</p>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                 {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.map(post => (
                        <BlogPostCard key={post.title} {...post} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BlogPage;
