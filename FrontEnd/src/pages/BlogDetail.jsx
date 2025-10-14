// src/pages/BlogDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Dữ liệu giả lập tương tự BlogList.jsx
const MOCK_BLOGS = [
    {
        id: 1,
        title: "5 mẹo kéo dài tuổi thọ pin xe điện",
        thumbnailUrl: "/assets/blog-thumbs/pin1.jpg",
        createdAt: "2025-09-20T08:00:00Z",
        content: `
      <p>Pin xe điện là trái tim của phương tiện — việc bảo dưỡng đúng cách giúp bạn tiết kiệm chi phí và tăng hiệu suất vận hành.</p>
      <h2>1. Tránh để pin cạn hoàn toàn</h2>
      <p>Nên sạc lại khi pin còn khoảng 20-30% để giảm hao mòn tế bào pin.</p>
      <h2>2. Không sạc quá đầy</h2>
      <p>Hạn chế sạc đến 100% liên tục, mức lý tưởng là 80–90%.</p>
      <h2>3. Bảo quản nơi khô ráo</h2>
      <p>Không để xe hoặc pin ở nơi quá nóng, ẩm, hoặc dưới ánh nắng trực tiếp trong thời gian dài.</p>
      <p>Tham khảo thêm hướng dẫn chi tiết trên trang hỗ trợ kỹ thuật của chúng tôi để giữ pin khỏe mạnh lâu dài.</p>
    `,
    },
    {
        id: 2,
        title: "Nên chọn xe điện cũ hay mới? Lời khuyên cho người mới bắt đầu",
        thumbnailUrl: "/assets/blog-thumbs/xe-cu.jpg",
        createdAt: "2025-09-10T10:30:00Z",
        content: `
      <p>Xe điện cũ là lựa chọn tiết kiệm nhưng cần kiểm tra kỹ để tránh rủi ro. Bài viết này sẽ giúp bạn phân tích chi tiết.</p>
      <h2>Xe mới — ưu và nhược điểm</h2>
      <ul>
        <li>✅ Bảo hành chính hãng, pin còn mới, an tâm sử dụng</li>
        <li>❌ Giá cao hơn, khấu hao nhanh 2–3 năm đầu</li>
      </ul>
      <h2>Xe cũ — ưu và nhược điểm</h2>
      <ul>
        <li>✅ Giá rẻ hơn 30–50%</li>
        <li>❌ Cần kiểm tra pin, sạc, và động cơ kỹ trước khi mua</li>
      </ul>
      <p>Nếu bạn là người dùng mới, hãy chọn xe cũ từ các nền tảng uy tín có chính sách kiểm định rõ ràng.</p>
    `,
    },
    {
        id: 3,
        title: "Cách kiểm tra bộ sạc nhanh và bảo quản pin hiệu quả",
        thumbnailUrl: "/assets/blog-thumbs/sac.jpg",
        createdAt: "2025-08-01T12:00:00Z",
        content: `
      <p>Sạc là thành phần quan trọng quyết định tuổi thọ pin. Kiểm tra định kỳ giúp tránh cháy nổ và sạc chậm.</p>
      <h2>1. Kiểm tra dây sạc</h2>
      <p>Đảm bảo không có vết nứt, gãy hoặc lỏng đầu nối.</p>
      <h2>2. Theo dõi nhiệt độ khi sạc</h2>
      <p>Nếu pin hoặc củ sạc quá nóng, hãy ngắt kết nối ngay.</p>
      <h2>3. Dùng ổ điện riêng</h2>
      <p>Không nên dùng chung ổ cắm với thiết bị công suất cao để tránh quá tải điện.</p>
    `,
    },
];

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const found = MOCK_BLOGS.find((b) => b.id === Number(id));
        setPost(found);
    }, [id]);

    if (!post)
        return <p className="text-center text-gray-500 mt-10">Bài viết không tồn tại.</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <Link
                to="/blog"
                className="text-blue-500 hover:underline text-sm mb-6 inline-block"
            >
                ← Quay lại danh sách
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
            <p className="text-gray-500 text-sm mb-6">
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
            </p>

            <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-full h-72 object-cover rounded-xl mb-6"
            />

            <div
                className="prose prose-blue max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </div>
    );
}
