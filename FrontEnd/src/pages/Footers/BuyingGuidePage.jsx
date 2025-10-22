import React from 'react';
import { FiSearch, FiCheckCircle, FiShoppingCart, FiTruck } from 'react-icons/fi';

const GuideStep = ({ icon, title, description }) => (
    <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-yellow-100 text-[#B8860B] rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">{description}</p>
        </div>
    </div>
);

function BuyingGuidePage() {
    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
            <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-serif tracking-wider">Hướng Dẫn Mua Hàng</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Quy trình đơn giản để sở hữu sản phẩm xe điện và pin chất lượng từ Cóc Mua Xe.</p>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="space-y-12">
                    <GuideStep
                        icon={<FiSearch size={24} />}
                        title="Bước 1: Tìm Kiếm & Khám Phá"
                        description="Sử dụng thanh tìm kiếm và các bộ lọc để duyệt qua danh sách xe điện và pin của chúng tôi. Mỗi sản phẩm đều có thông tin chi tiết, hình ảnh và báo cáo tình trạng để bạn tham khảo."
                    />
                    <GuideStep
                        icon={<FiCheckCircle size={24} />}
                        title="Bước 2: Kiểm Tra & Lựa Chọn"
                        description="Đọc kỹ mô tả sản phẩm, đặc biệt là các thông số kỹ thuật như dung lượng pin, số km đã đi (đối với xe), và tình trạng đã được xác minh. So sánh các lựa chọn để tìm ra sản phẩm phù hợp nhất với nhu cầu của bạn."
                    />
                    <GuideStep
                        icon={<FiShoppingCart size={24} />}
                        title="Bước 3: Thêm Vào Giỏ Hàng & Thanh Toán"
                        description="Khi bạn đã sẵn sàng, hãy thêm sản phẩm vào giỏ hàng. Tại trang thanh toán, bạn sẽ cung cấp địa chỉ giao hàng và chọn phương thức thanh toán. Quy trình của chúng tôi an toàn và được mã hóa."
                    />
                    <GuideStep
                        icon={<FiTruck size={24} />}
                        title="Bước 4: Giao Hàng & Nhận Sản Phẩm"
                        description="Sau khi xác nhận đơn hàng, chúng tôi sẽ đóng gói cẩn thận và vận chuyển sản phẩm đến địa chỉ của bạn. Bạn có thể theo dõi hành trình đơn hàng và sẽ nhận được thông báo khi hàng sắp đến."
                    />
                </div>
            </div>
        </div>
    );
}

export default BuyingGuidePage;
