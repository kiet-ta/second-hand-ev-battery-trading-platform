// src/pages/BlogList.jsx
import React, { useEffect, useState } from "react";
import BlogHeader from "../components/BlogHeader";
import BlogCard from "../components/BlogCard";

const MOCK_BLOGS = [
    {
        id: 1,
        title: "5 mẹo kéo dài tuổi thọ pin xe điện",
        summary:
            "Những thói quen đơn giản giúp pin xe điện khỏe và bền hơn trong quá trình sử dụng hằng ngày.",
        thumbnailUrl: "/assets/blog-thumbs/pin1.jpg",
        createdAt: "2025-09-20T08:00:00Z",
    },
    {
        id: 2,
        title: "Nên chọn xe điện cũ hay mới? Lời khuyên cho người mới bắt đầu",
        summary:
            "So sánh lợi ích, rủi ro và chia sẻ kinh nghiệm mua xe điện cũ tiết kiệm chi phí mà vẫn đảm bảo chất lượng.",
        thumbnailUrl: "/assets/blog-thumbs/xe-cu.jpg",
        createdAt: "2025-09-10T10:30:00Z",
    },
    {
        id: 3,
        title: "Cách kiểm tra bộ sạc nhanh và bảo quản pin hiệu quả",
        summary:
            "Hướng dẫn test sạc, nhận biết sạc lỗi và mẹo bảo dưỡng pin giúp tăng hiệu suất xe điện.",
        thumbnailUrl: "/assets/blog-thumbs/sac.jpg",
        createdAt: "2025-08-01T12:00:00Z",
    },
];

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        // giả lập API call
        setTimeout(() => setBlogs(MOCK_BLOGS), 500);
    }, []);

    return (
        <div>
            <BlogHeader />

            <div className="max-w-6xl mx-auto px-4 py-12">
                {blogs.length === 0 ? (
                    <p className="text-center text-gray-500">Đang tải...</p>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
