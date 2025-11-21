import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { FiClock, FiBatteryCharging, FiZap, FiHeart, FiGift } from 'react-icons/fi';
import itemApi from '../../api/itemApi';
import favouriteApi from '../../api/favouriteApi';
import ProductSection from '../../components/Cards/ProductSection';
import CardComponent from '../../components/Cards/Card';
import GeminiChatWidget from "../../components/GeminiChatWidget";
import CardSkeleton from '../../components/Cards/CardSkeleton';
import SectionHeader from '../../components/SectionHeader';
import CompareToast from "../../components/CompareToast";
import CompareModal from "../../components/CompareModal";
import newsApi from "../../api/newsApi";
import { Newspaper } from "lucide-react";



const FiArrowRight = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const HeroAdvert = ({ imageUrl, title, description, link, ctaText }) => (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-2xl mb-16 group">
        <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent p-8 flex flex-col justify-end text-white">
            <h1 className="text-5xl md:text-6xl font-extrabold font-roboto mb-4 drop-shadow-lg text-yellow-300">
                {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-6 drop-shadow-md">
                {description}
            </p>
            <Link
                to={link}
                className="inline-flex items-center justify-center px-8 py-3 bg-yellow-600 text-gray-950 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 w-fit"
            >
                {ctaText} <FiArrowRight className="ml-2" />
            </Link>
        </div>
    </div>
);


function HomePage() {
    const [data, setData] = useState({ firstSale: [], evList: [], batteryList: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userFavorites, setUserFavorites] = useState([]);
    const userId = localStorage.getItem("userId");
    const [latestNews, setLatestNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);



    const isItemVerified = (item) => item.moderation === 'Approved';




    const refetchFavorites = useCallback(async () => {
        if (!userId) { setUserFavorites([]); return; }
        try {
            const favorites = await favouriteApi.getFavouriteByUserID(userId);
            setUserFavorites(favorites || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách yêu thích:", err);
        }
    }, [userId]);

    useEffect(() => {

        const fetchAllItems = async () => {

            setLoading(true);
            try {
                const news = await newsApi.getNews();
                setLatestNews(news.slice(0, 3));
                const [items, evs, batteries] = await Promise.all([
                    itemApi.getItem(),
                    itemApi.getItemByLatestEV(),
                    itemApi.getItemByLatestBattery()
                ]);

                setData({
                    firstSale: items.slice(0, 3),
                    evList: evs,
                    batteryList: batteries
                });

                if (userId) {
                    await refetchFavorites();
                }

            } catch (err) {
                console.error("Lỗi khi tải sản phẩm:", err);
                setError("Không thể tải sản phẩm. Vui lòng kiểm tra kết nối và thử lại.");
            } finally {
                setLoading(false);
                setLoadingNews(false);

            }
        };
        fetchAllItems();
    }, [refetchFavorites, userId]);

    if (error) {
        return (
            <div className="p-8">
                <Alert message="Lỗi" description={error} type="error" showIcon />
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
                    
                    .font-roboto { 
                        font-family: 'Playfair Display', serif; 
                    }
                `}
            </style>
            <div className="HomePage w-full m-0 p-0 min-h-screen overflow-y-auto
                bg-[#FAF8F3] text-[#2C2C2C] font-['Inter']">

                <GeminiChatWidget />
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                    {loading ? (
                        <div className="w-full h-[500px] bg-gray-200 rounded-xl shadow-2xl animate-pulse mb-16"></div>
                    ) : (
                        <HeroAdvert
                            imageUrl="https://excelbattery.com/wp-content/uploads/2023/11/final-banner1.jpg"
                            title="Khai Phá Năng Lượng Tương Lai"
                            description="Khám phá các linh kiện xe điện hiếm và hiệu suất cao. Mỗi sản phẩm đều được tuyển chọn dành cho người sành sỏi."
                            ctaText="Khám Phá Bộ Sưu Tập"
                            link="/news/1002"
                        />
                    )}

                    <SectionHeader
                        title="Sản Phẩm Nổi Bật"
                        icon={FiZap}
                        description="Được tuyển chọn kỹ lưỡng với giá trị vượt trội và luôn có sẵn. Đừng bỏ lỡ những cơ hội độc đáo này."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 justify-items-center">
                        {loading
                            ? Array.from({ length: 3 }).map((_, index) => <CardSkeleton key={index} />)
                            : data.firstSale.map((item) => (
                                <CardComponent
                                    key={item.itemId}
                                    id={item.itemId}
                                    title={item.title}
                                    type={item.itemType}
                                    price={item.price}
                                    sales={0}
                                    year={item.itemDetail?.year}
                                    mileage={item.itemDetail?.mileage}
                                    itemImages={item.images}
                                    isVerified={isItemVerified(item)}
                                    userFavorites={userFavorites}
                                    onFavoriteChange={refetchFavorites}
                                    updatedBy={item.updatedBy}
                                />
                            ))}
                    </div>

                    <div className="Banner mt-10 mx-auto mb-16 border-2 border-[#C4B5A0]/60 rounded-xl overflow-hidden shadow-lg">
                        <img
                            src="https://i.pinimg.com/1200x/fb/85/3e/fb853ef4ce1addf32f60d85bb8b296b2.jpg"
                            className="h-40 sm:h-56 w-full object-cover opacity-95 transition-opacity duration-300 hover:opacity-100"
                            alt="Biểu ngữ quảng cáo"
                        />
                    </div>

                    <SectionHeader
                        title="Xe Điện Cổ Điển"
                        icon={FiClock}
                        description="Bộ sưu tập các dòng xe điện cổ điển và hiếm, thể hiện thiết kế vượt thời gian và năng lượng bền vững."
                    />
                    <ProductSection
                        items={data.evList.map(item => ({ ...item, isVerified: isItemVerified(item) }))}
                        loading={loading}
                        userFavorites={userFavorites}
                        onFavoriteChange={refetchFavorites}
                        itemType="Ev"
                    />

                    <div className="my-16 text-center border-2 border-[#C4B5A0]/40 rounded-xl overflow-hidden shadow-lg bg-white">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/022/479/930/non_2x/3d-li-ion-aa-battery-discharging-and-its-electric-waves-banner-advertisement-designed-on-a-blue-black-background-vector.jpg"
                            alt="Công nghệ Pin Tiên tiến"
                            className="w-full max-h-72 object-cover"
                        />
                        <p className="text-gray-500 text-sm p-4 italic">
                            "Tiếp năng lượng cho tương lai, trong từng lần sạc."
                        </p>
                    </div>

                    <SectionHeader
                        title="Pin Chất Lượng Cao"
                        icon={FiBatteryCharging}
                        description="Các lõi pin tinh xảo được chế tạo cho độ bền và hiệu suất vô song trong các ứng dụng đòi hỏi khắt khe nhất."
                    />
                    <ProductSection
                        items={data.batteryList.map(item => ({ ...item, isVerified: isItemVerified(item) }))}
                        loading={loading}
                        userFavorites={userFavorites}
                        onFavoriteChange={refetchFavorites}
                        itemType="Battery"
                    />

<div className="mt-24">
  <SectionHeader
    title="Tin Tức Mới Nhất"
    icon={Newspaper}
    description="Khám phá xu hướng mới, công nghệ và những câu chuyện truyền cảm hứng về xe điện."
  />

  {loadingNews ? (
    <div className="flex justify-center py-12">
      <Spin size="large" />
    </div>
  ) : (
    <div className="space-y-6">
      {latestNews.map((post) => (
        <Link
          key={post.newsId}
          to={`/news/${post.newsId}`}
          state={post}
          className="flex flex-col md:flex-row items-center gap-6 p-5 bg-white border-2 border-[#C4B5A0]/40 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full md:w-64 h-48 object-cover rounded-xl"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-roboto font-bold text-[#2C2C2C] mb-2">
              {post.title}
            </h3>
            <p className="text-gray-600 mb-3 line-clamp-3">{post.summary}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="bg-[#F8F5E9] text-[#B8860B] px-3 py-1 rounded-full font-semibold">
                {post.category}
              </span>
              <span>
                {new Date(post.publishDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )}
</div>
                </div>
                <div className="h-20"></div>

                {/* ⚡️ Compare Components */}
                <CompareToast />
                <CompareModal />
            </div>
        </>
    );
}

export default HomePage;

