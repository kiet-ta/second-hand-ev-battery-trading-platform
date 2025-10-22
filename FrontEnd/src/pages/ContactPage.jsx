import React from 'react';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

function ContactPage() {
  return (
    <div
      className="bg-[#FAF8F3] text-[#2C2C2C]"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      <div className="py-20 text-center bg-white border-b border-[#E8E4DC]">
        <h1 className="text-5xl font-extrabold font-serif tracking-wider text-[#2C2C2C]">
          Liên Hệ Với Chúng Tôi
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Chúng tôi luôn sẵn lòng lắng nghe! Gửi câu hỏi hoặc phản hồi của bạn
          cho chúng tôi.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-[#E8E4DC]">
            <h2 className="text-3xl font-bold text-[#B8860B] mb-6">
              Gửi Lời Nhắn
            </h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="font-semibold">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full mt-2 border border-[#E8E4DC] rounded p-3 focus:outline-[#D4AF37] bg-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full mt-2 border border-[#E8E4DC] rounded p-3 focus:outline-[#D4AF37] bg-white"
                />
              </div>
              <div>
                <label htmlFor="message" className="font-semibold">
                  Lời Nhắn
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  className="w-full mt-2 border border-[#E8E4DC] rounded p-3 focus:outline-[#D4AF37] bg-white"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-[#2C2C2C] font-bold py-3 px-6 rounded-lg hover:bg-[#B8860B] transition-colors"
                >
                  Gửi
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-[#E8E4DC]">
              <h3 className="text-2xl font-bold mb-6">Thông Tin Liên Lạc</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FiMapPin className="w-6 h-6 text-[#B8860B] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Văn Phòng Chính</h4>
                    <p className="text-gray-600">
                      Khu phố 6, Dĩ An, Bình Dương, Việt Nam
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FiMail className="w-6 h-6 text-[#B8860B] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Email Hỗ Trợ</h4>
                    <a
                      href="mailto:support@cocmuaxe.com"
                      className="text-gray-600 hover:text-[#B8860B]"
                    >
                      support@cocmuaxe.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FiPhone className="w-6 h-6 text-[#B8860B] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Điện Thoại</h4>
                    <a
                      href="tel:+84987654321"
                      className="text-gray-600 hover:text-[#B8860B]"
                    >
                      (+84) 987 654 321
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-80 rounded-lg overflow-hidden shadow-lg border border-[#E8E4DC]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.231242442253!2d106.71182231533256!3d10.86982299225791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527e7e8abb035%3A0x2f53946325983808!2sKhu%20ph%E1%BB%91%206%2C%20D%C4%A9%20An%2C%20B%C3%ACnh%20D%C6%B0%C6%A1ng%2C%20Vi%E1%BB%87t%20Nam!5e0!3m2!1svi!2s!4v1666426477163!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
