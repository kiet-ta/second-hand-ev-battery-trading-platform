import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';
import auctionApi from '../../api/auctionApi';
import itemApi from '../../api/itemApi';

// --- SVG ICONS ---
const ChevronLeft = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 256 512">
    <path d="M192 480c-7.3 0-14.7-2.9-20-8.2L12.3 268.3c-10.4-10.4-10.4-27.3 0-37.7L172 8.2c10.4-10.4 27.3-10.4 37.7 0s10.4 27.3 0 37.7L50.1 250l159.6 159.6c10.4 10.4 10.4 27.3 0 37.7-5.2 5.3-12.5 8.3-20 8.3z" />
  </svg>
);
const ChevronRight = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 256 512">
    <path d="M64 480c-7.3 0-14.7-2.9-20-8.2-10.4-10.4-10.4-27.3 0-37.7L205.9 250 44 90.3c-10.4-10.4-10.4-27.3 0-37.7s27.3-10.4 37.7 0L243.7 230.3c10.4 10.4 10.4 27.3 0 37.7L82 471.8c-5.3 5.3-12.6 8.2-20 8.2z" />
  </svg>
);
const RegClock = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 512 512">
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm24 288h-48V120c0-13.3 10.7-24 24-24s24 10.7 24 24v160c0 4.4-3.6 8-8 8z" />
  </svg>
);
const ArrowRight = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 448 512">
    <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h306.7L233.3 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
  </svg>
);

// --- HELPERS ---
const formatCountdown = (status, startTimeStr, endTimeStr) => {
  const now = new Date().getTime();
  const startTime = new Date(startTimeStr).getTime();
  const endTime = new Date(endTimeStr).getTime();

  let distance;
  let label = "Kết thúc sau";

  if (status === 'UPCOMING') {
    distance = startTime - now;
    label = "Bắt đầu sau";
  } else if (status === 'ONGOING') {
    distance = endTime - now;
  } else {
    distance = 0;
  }

  if (distance <= 0) return { time: "Đã kết thúc", label: "Trạng thái", isFinished: true, distance: 0 };

  const d = Math.floor(distance / (1000 * 60 * 60 * 24));
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((distance % (1000 * 60)) / 1000);
  const pad = (n) => n.toString().padStart(2, '0');

  return {
    time: d > 0 ? `${d}d ${pad(h)}h` : `${pad(h)}h ${pad(m)}m ${pad(s)}s`,
    label,
    isFinished: false,
    distance,
  };
};

const sendGroupNotification = async (userIds, title, message) => {
  const SENDER_ID = 4;
  const payloads = userIds.map(uid => ({
    notiType: "activities",
    senderId: SENDER_ID,
    senderRole: "manager",
    title,
    message,
    targetUserId: uid.toLocaleString(),
  }));

  await Promise.all(payloads.map(p => notificationApi.createNotification(p).catch(() => null)));
};

// --- MAIN COMPONENT ---
const CarAuctionCard = ({
  auctionID,
  id,
  title,
  category,
  currentBid = 0,
  startingPrice = 0,
  endTime,
  startTime,
  status,
  imageUrls = [],
}) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState(() => formatCountdown(status, startTime, endTime));
  const [bidders, setBidders] = useState([]);
  const [sellerId, setSellerId] = useState(null);

  const endNotiSent = useRef(false);
  const warnNotiSent = useRef(false);
  const placeholder = `https://placehold.co/600x400/fdfaf5/9c8c6a?text=${encodeURIComponent(title)}`;

  // Fetch bidders
  useEffect(() => {
    if (!id || status === 'UPCOMING') return;
    auctionApi.getBiddingHistory(auctionID)
      .then(hist => setBidders([...new Set(hist.map(b => b.userId))]))
      .catch(() => {});
      itemApi.getItemById(id)
      .then(item => {
        if (item?.sellerId) {
          setBidders(b => [...new Set([...b, item.updatedBy])]);
        }
      })
      .catch(() => {});
  }, [auctionID, id, status]);

  // Countdown + Notifications
  useEffect(() => {
    const tick = () => {
      const newCountdown = formatCountdown(status, startTime, endTime);
      setCountdown(newCountdown);

      if (status === 'ONGOING' && bidders.length > 0 && !newCountdown.isFinished) {
        const { distance } = newCountdown;
        if (distance <= 300000 && !warnNotiSent.current) {
          warnNotiSent.current = true;
          console.log('Sending ending soon notification to bidders:', bidders);
          sendGroupNotification(bidders, `⏰ Sắp kết thúc!`, `Đấu giá cho "${title}" chỉ còn dưới 5 phút!`);
        }
        if (distance <= 0 && !endNotiSent.current) {
          endNotiSent.current = true;
          sendGroupNotification(bidders, `✅ Đấu giá kết thúc`, `Sản phẩm "${title}" đã kết thúc.`);
        }
      }
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, startTime, endTime, bidders, title]);

  const handleClick = useCallback(() => navigate(`/auction/${id}`), [navigate, id]);
  const next = useCallback(e => { e.stopPropagation(); setCurrentSlide(p => (p + 1) % imageUrls.length); }, [imageUrls.length]);
  const prev = useCallback(e => { e.stopPropagation(); setCurrentSlide(p => (p - 1 + imageUrls.length) % imageUrls.length); }, [imageUrls.length]);

  const displayImg = imageUrls[currentSlide]?.imageUrl || placeholder;
  const displayPrice = currentBid > 0 ? currentBid : startingPrice;
  const formatCurrency = (v) => (v || 0).toLocaleString('vi-VN') + ' ₫';

  const isUpcoming = countdown.label.includes('Bắt đầu');
  const isEnded = countdown.isFinished;

  return (
    <div
      onClick={handleClick}
      className="flex flex-col w-full max-w-sm bg-[#fdfaf5] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#f1e5c8]/70 will-change-transform hover:-translate-y-1"
    >
      {/* Image Carousel */}
      <div className="relative h-60 overflow-hidden group">
        <img
          src={displayImg}
          loading="lazy"
          alt={title}
          onError={(e) => { e.currentTarget.src = placeholder; }}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          style={{ willChange: 'transform' }}
        />
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-[#fff6e5]/80 p-2 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-[#fff6e5]/80 p-2 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow text-[#2e2a27]">
        <p className="text-sm text-gray-500 mb-1">{category}</p>
        <h2 className="text-lg font-bold leading-snug line-clamp-2">{title}</h2>

        <div className="mt-4 pt-4 border-t border-[#eadfcb] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                {currentBid > 0 ? "Giá hiện tại" : "Giá khởi điểm"}
              </p>
              <p className="text-xl font-extrabold text-[#d4a93b]">{formatCurrency(displayPrice)}</p>
            </div>

            <div className={`text-right ${isEnded ? 'text-red-500' : 'text-gray-700'}`}>
              <p className="text-xs text-gray-500">{countdown.label}</p>
              <div className="flex items-center gap-1.5 font-semibold">
                <RegClock className="w-3 h-3" />
                <span>{countdown.time}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClick}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm flex justify-center items-center shadow-md transition-all duration-200 ${
              isUpcoming
                ? 'bg-[#e0b45b] text-white hover:bg-[#d2a146]'
                : isEnded
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-[#c5973b] text-white hover:bg-[#b5852f]'
            }`}
          >
            {isUpcoming ? 'Xem trước' : isEnded ? 'Xem kết quả' : 'Tham gia đấu giá'}
            <ArrowRight className="ml-2 w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CarAuctionCard);
