import { useState } from "react";
import { useNavigate } from "react-router-dom";
import chatApi from "../../api/chatApi";
import PropTypes from "prop-types";


const ChatWithSellerButton = ({ buyerId, sellerId, product }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChat = async (type) => {
    if (buyerId === sellerId) {
      alert("Bạn không thể nhắn tin cho chính mình!");
      return;
    }

    setLoading(true);
    try {
      const room = await chatApi.createChatRoom(buyerId, sellerId);

      let messageText = "Xin chào!";

      if (type === "interest") {
        messageText = JSON.stringify({
          type: "Ev",
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          itemId: product.id,
          note: "Người mua quan tâm đến sản phẩm này",
        });
      }

      // Step 3: Send message
      await chatApi.sendChatMessage({
        cid: room.cid,
        from: buyerId,
        to: sellerId,
        text: messageText,
      });

      // Step 4: Navigate to chat screen
      navigate("/profile/chats", {
        state: { chatRoomId: room.cid, receiverId: sellerId },
      });
    } catch (error) {
      console.error(error);
      alert("Không thể mở cuộc trò chuyện, vui lòng thử lại.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Buttons */}
      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={(e) => {
            handleChat("normal");
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex-1 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
        >
          {loading ? "Đang mở..." : "Nhắn tin"}
        </button>
        <button
          disabled={loading}
          onClick={(e) => {
            setShowConfirm(true)
            e.preventDefault();
            e.stopPropagation();

          }}
          className="flex-1 bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-amber-600 transition"
        >
          {loading ? "Đang xử lý..." : "Quan tâm sản phẩm"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Gửi thông tin sản phẩm cho người bán?
            </h3>
            <div className="flex items-center gap-4 border rounded-xl p-3 bg-[#FFF7E5] mb-4">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-16 h-16 rounded-lg border object-cover"
              />
              <div>
                <p className="font-semibold text-gray-700">{product.title}</p>
                <p className="text-amber-700 font-bold text-sm">
                  {product.price?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Tin nhắn sẽ bao gồm thông tin sản phẩm và lời chào tự động.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  setShowConfirm(false)
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={(e) => {
                  handleChat("interest")
                  e.preventDefault();
                  e.stopPropagation();
                }}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
              >
                {loading ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
ChatWithSellerButton.propTypes = {
  buyerId: PropTypes.number.isRequired,
  sellerId: PropTypes.number.isRequired,
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
};

export default ChatWithSellerButton;