import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Mail, Phone, Calendar, Star } from "lucide-react";

export default function BuyerViewSeller() {
    const { sellerId } = useParams(); // 🧠 ví dụ: /seller/2
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🧩 Fake API
    const fakeSeller = {
        userId: sellerId || 1,
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phoneNumber: "0987 654 321",
        address: "Quận 1, TP. Hồ Chí Minh",
        avatar:
            "https://cdn-icons-png.flaticon.com/512/219/219970.png",
        bio: "Người bán chuyên nghiệp với hơn 3 năm kinh nghiệm trong lĩnh vực xe điện và pin.",
        createdAt: "2022-03-15T00:00:00Z",
        rating: 4.8,
    };

    const fakeItems = [
        {
            itemId: 1,
            title: "Xe điện VinFast Klara S",
            description: "Xe chạy êm, tiết kiệm năng lượng, pin còn 90%.",
            price: 18000000,
            imageUrl: "https://vinfastauto.com/themes/porto/img/vinfast-klara-s.jpg",
        },
        {
            itemId: 2,
            title: "Pin Lithium 60V 20Ah",
            description: "Pin dùng cho xe điện, còn rất mới, hiệu suất tốt.",
            price: 4500000,
            imageUrl: "https://cdn.tgdd.vn/Files/2023/04/24/1524509/pin-lithium-la-gi-co-uu-nhuoc-diem-gi-cac-loai-pin-lithium-202304241650454301.jpg",
        },
        {
            itemId: 3,
            title: "Xe điện Dibao Pansy S",
            description: "Đã sử dụng 1 năm, còn rất bền, màu trắng ngọc trai.",
            price: 14500000,
            imageUrl: "https://cdn.honda.com.vn/motorbike-versions/December2022/5HnPSnGuYaYZr6qO1z9b.jpg",
        },
        {
            itemId: 4,
            title: "Pin Lithium 72V 30Ah",
            description: "Dung lượng lớn, phù hợp cho xe tải điện hoặc xe đường dài.",
            price: 7200000,
            imageUrl: "https://cdn.tgdd.vn/Files/2021/10/18/1392458/pin-lithium-la-gi-uu-diem-cua-pin-lithium-so-voi-pin-chua-axit-202110180930101812.jpg",
        },
    ];

    useEffect(() => {
        // 🕒 Giả lập fetch dữ liệu từ server (delay 1.5s)
        setLoading(true);
        setTimeout(() => {
            setSeller(fakeSeller);
            setItems(fakeItems);
            setLoading(false);
        }, 1500);
    }, [sellerId]);

    if (loading) return <div className="text-center py-10 text-gray-500">⏳ Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* 🧑‍💼 Thông tin người bán */}
            <div className="flex flex-col md:flex-row items-center bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-6 gap-6 mb-10">
                <img
                    src={seller.avatar}
                    alt={seller.fullName}
                    className="w-32 h-32 rounded-full object-cover border"
                />

                <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-2">{seller.fullName}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {seller.bio}
                    </p>

                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Mail size={18} /> <span>{seller.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={18} /> <span>{seller.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} /> <span>{seller.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />{" "}
                            <span>
                                Tham gia:{" "}
                                {new Date(seller.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" />{" "}
                            <span>Đánh giá: {seller.rating}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🛍️ Danh sách sản phẩm */}
            <h3 className="text-xl font-semibold mb-4">Sản phẩm đang bán</h3>

            {items.length === 0 ? (
                <div className="text-gray-500">Người bán chưa có sản phẩm nào.</div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.itemId}
                            className="bg-white dark:bg-neutral-900 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all"
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                                <h4 className="font-semibold text-lg mb-1 line-clamp-1">
                                    {item.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {item.description}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
                                    {item.price.toLocaleString("vi-VN")} ₫
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
