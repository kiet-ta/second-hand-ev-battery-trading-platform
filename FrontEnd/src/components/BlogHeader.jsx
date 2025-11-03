import React from "react";

export default function BlogHeader() {
    return (
        <div className="relative bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                    Tin tức & Bài viết
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Cập nhật xu hướng xe điện, công nghệ pin và câu chuyện người dùng —
                    từ cộng đồng EV Việt Nam.
                </p>
            </div>
        </div>
    );
}
