import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo'; // Assuming Logo component is in the same directory or adjust path

// SVG Icons for Social Media
const FacebookIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
);

const InstagramIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.406-11.845a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" clipRule="evenodd" />
    </svg>
);

const TwitterIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
);

function Footer() {
    const textPrimary = 'text-[#2C2C2C]';
    const textSecondary = 'text-gray-600';
    const textHover = 'hover:text-[#B8860B]';
    const borderColor = 'border-[#C4B5A0]';

    const companyLinks = [
        { title: 'Về Chúng Tôi', link: '/about' },
        { title: 'Tuyển Dụng', link: '/careers' },
        { title: 'Báo Chí', link: '/press' },
    ];

    const legalLinks = [
        { title: 'Chính Sách Bảo Mật', link: '/privacy-policy' },
        { title: 'Điều Khoản Dịch Vụ', link: '/terms-of-service' },
    ];

    const supportLinks = [
        { title: 'Liên Hệ', link: '/contact' },
        { title: 'Câu Hỏi Thường Gặp', link: '/faq' },
        { title: 'Hướng Dẫn Mua Hàng', link: '/buying-guide' },
    ];

    const discoverLinks = [
        { title: 'Xe Điện', link: '/search?itemType=EV' },
        { title: 'Pin', link: '/search?itemType=Battery' },
        { title: 'Tin tức', link: '/news' },
    ];

    return (
        <footer className={`w-full bg-[#E8E4DC] ${textPrimary} mt-auto`}> {/* Use mt-auto if needed, check MainLayout structure */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <Logo />
                        <p className={`${textSecondary} text-sm leading-relaxed`}>
                            Nền tảng uy tín hàng đầu cho việc mua bán xe điện và pin đã qua sử dụng. Chúng tôi mang đến chất lượng và sự tin cậy cho mỗi sản phẩm.
                        </p>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div>
                            <h3 className={`text-base font-bold ${textPrimary} tracking-wider uppercase mb-4`}>Công Ty</h3>
                            <ul className="space-y-3">
                                {companyLinks.map((item) => (
                                    <li key={item.title}>
                                        <Link to={item.link} className={`text-base ${textSecondary} ${textHover}`}>
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className={`text-base font-bold ${textPrimary} tracking-wider uppercase mb-4`}>Hỗ Trợ</h3>
                            <ul className="space-y-3">
                                {supportLinks.map((item) => (
                                    <li key={item.title}>
                                        <Link to={item.link} className={`text-base ${textSecondary} ${textHover}`}>
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className={`text-base font-bold ${textPrimary} tracking-wider uppercase mb-4`}>Khám Phá</h3>
                            <ul className="space-y-3">
                                {discoverLinks.map((item) => (
                                    <li key={item.title}>
                                        <Link to={item.link} className={`text-base ${textSecondary} ${textHover}`}>
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className={`text-base font-bold ${textPrimary} tracking-wider uppercase mb-4`}>Pháp Lý</h3>
                            <ul className="space-y-3">
                                {legalLinks.map((item) => (
                                    <li key={item.title}>
                                        <Link to={item.link} className={`text-base ${textSecondary} ${textHover}`}>
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={`mt-12 pt-8 border-t ${borderColor} flex flex-col sm:flex-row items-center justify-between`}>
                    <p className={`${textSecondary} text-sm`}>
                        &copy; {new Date().getFullYear()} Cóc Mua Xe. Đã đăng ký bản quyền.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;