import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[#E8E4DC]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-5 px-6 font-semibold text-lg hover:bg-yellow-50/50"
            >
                <span>{title}</span>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isOpen && (
                <div className="px-6 pb-5 text-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};

function FaqPage() {
    return (
        <div className="bg-[#FAF8F3] text-[#2C2C2C] overflow-y-auto">
             <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
                <h1 className="text-5xl font-extrabold font-serif tracking-wider">Câu Hỏi Thường Gặp</h1>
                <p className="mt-4 text-lg text-gray-600">Tìm câu trả lời cho các câu hỏi phổ biến nhất.</p>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-lg shadow-lg border border-[#E8E4DC] overflow-hidden">
                    <AccordionItem title="Làm thế nào để mua một sản phẩm?">
                        <p>Để mua hàng, chỉ cần duyệt qua các sản phẩm của chúng tôi, thêm mặt hàng bạn muốn vào giỏ hàng và tiến hành thanh toán. Bạn sẽ cần cung cấp thông tin giao hàng và thanh toán để hoàn tất đơn hàng.</p>
                    </AccordionItem>
                    <AccordionItem title="Chất lượng của pin đã qua sử dụng được đảm bảo như thế nào?">
                        <p>Mỗi viên pin đều trải qua một quy trình kiểm tra nghiêm ngặt bởi các kỹ thuật viên của chúng tôi. Chúng tôi kiểm tra dung lượng, sức khỏe và độ an toàn để đảm bảo nó đáp ứng các tiêu chuẩn cao của chúng tôi trước khi được niêm yết.</p>
                    </AccordionItem>
                    <AccordionItem title="Chính sách vận chuyển của bạn là gì?">
                        <p>Chúng tôi cung cấp dịch vụ vận chuyển toàn quốc. Thời gian giao hàng dự kiến là từ 3-5 ngày làm việc. Tất cả các lô hàng đều được bảo hiểm để đảm bảo sản phẩm của bạn đến nơi an toàn.</p>
                    </AccordionItem>
                    <AccordionItem title="Tôi có thể bán xe điện hoặc pin của mình trên Cóc Mua Xe không?">
                        <p>Chắc chắn rồi! Chúng tôi luôn tìm kiếm những sản phẩm chất lượng. Vui lòng truy cập trang "Người Bán" của chúng tôi để tìm hiểu thêm về quy trình và đăng ký trở thành người bán.</p>
                    </AccordionItem>
                </div>
            </div>
        </div>
    );
}

export default FaqPage;
