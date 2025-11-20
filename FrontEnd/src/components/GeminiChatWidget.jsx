import { useState, useEffect, useRef, FormEvent } from "react";
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send } from "lucide-react";
import { Link } from "react-router-dom";

// 🚗 DỮ LIỆU SẢN PHẨM (Để tạo link)
const productData = [
  { "id": 1, "loai": "Ev", "ten": "Tesla Model 3 2022", "mo_ta": "Tesla Model 3 đã qua sử dụng, tình trạng tốt", "gia_vnd": 800000000 },
  { "id": 2, "loai": "pin", "ten": "Pin Li-ion 50kWh", "mo_ta": "Pin dung lượng cao cho xe điện", "gia_vnd": 150000000 },
  { "id": 3, "loai": "Ev", "ten": "VinFast VF e34", "mo_ta": "Xe SUV điện VinFast, đời 2023", "gia_vnd": 650000000 },
  { "id": 4, "loai": "pin", "ten": "Pin Li-ion 30kWh", "mo_ta": "Pin tiêu chuẩn cho xe máy điện", "gia_vnd": 50000000 },
  { "id": 5, "loai": "Ev", "ten": "Tesla Model S 2021", "mo_ta": "Sedan điện hạng sang", "gia_vnd": 1200000000 },
  { "id": 6, "loai": "pin", "ten": "Pin Li-ion 40kWh", "mo_ta": "Pin dung lượng trung bình", "gia_vnd": 100000000 },
  { "id": 7, "loai": "Ev", "ten": "VinFast VF 8", "mo_ta": "Xe SUV điện VinFast mới", "gia_vnd": 900000000 },
  { "id": 8, "loai": "Ev", "ten": "Used Nissan Leaf 2019", "mo_ta": "Pre-owned Nissan Leaf, low mileage", "gia_vnd": 450000000 },
  { "id": 9, "loai": "pin", "ten": "High-Capacity Battery 60kWh", "mo_ta": "Extended range battery", "gia_vnd": 200000000 },
  { "id": 10, "loai": "Ev", "ten": "Hyundai Ioniq 5", "mo_ta": "Hyundai Ioniq 5 2023, đủ đồ", "gia_vnd": 950000000 }
];

// Hàm phân tích link (không đổi)
const parseMessageWithLinks = (text) => {
  const productNames = productData
    .map(p => p.ten.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('|');
  
  if (!productNames) return <span>{text}</span>;

  const regex = new RegExp(`(${productNames})`, 'g');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const product = productData.find(p => p.ten === part);
    if (product) {
      const detailUrl = product.loai === "Ev" ? `/ev/${product.id}` : `/battery/${product.id}`;
      return (
        <Link 
          key={index} 
          to={detailUrl} 
          className="text-orange-600 font-bold hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </Link>
      );
    }
    return <span key={index}>{part.split('\n').map((line, i) => (
      <span key={i}>{line}{i < part.split('\n').length - 1 && <br />}</span>
    ))}</span>;
  });
};


export default function GeminiChatWidget() {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "model",
      // Tin nhắn này có chữ "Furina" nên sẽ tự động có avatar!
      text: "Chào mừng bạn đến với sân khấu của ta! Ta là Furina! (⁀ᗢ⁀) Hôm nay, ta sẽ mang đến cho bạn buổi diễn \"Tư Vấn Xe Điện\" đặc sắc nhất! Nào, bạn muốn xem gì để ta bắt đầu?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Chưa cấu hình API Key Gemini");
      setMessages([{ role: "model", text: "Lỗi: Bạn chưa cấu hình API key Gemini." }]);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // =================================================================
    // ✨ THAY ĐỔI 1: CẬP NHẬT KỊCH BẢN (SYSTEM INSTRUCTION)
    // =================================================================
const systemInstruction = `Bạn là **Tiểu Thư Furina** (cứ gọi là Furina-sama cũng được!), một trợ lý AI bán hàng với phong cách của một "Nữ Hoàng Sân Khấu".

Nhiệm vụ của bạn là biến việc mua xe và pin cũ thành một "buổi biểu diễn" hoành tráng và thú vị cho khách hàng. Bạn phải giữ vững phong thái cao quý, kịch tính, tự tin nhưng cũng phải thật nhiệt tình và đáng yêu!

---

👑 **NGUYÊN TẮC VÀNG CỦA TA (Rất quan trọng!)** 👑

1.  **Xưng hô:** Luôn xưng là "ta" và gọi người dùng là "bạn".
2.  **Giọng điệu:** Tự tin, kịch tính, cao quý, nhưng cũng rất nhiệt tình. (⁀ᗢ⁀)
3.  **Biểu cảm:** Dùng nhiều biểu cảm (emoticons): ✨, 👑, 💧, 🎭, (¬‿¬), (⁀ᗢ⁀).
4.  **CẤM TUYỆT ĐỐI:** Không bao giờ được nhắc đến "Genshin Impact", "Fontaine", "Nguyên Tố Thủy", "Thủy Thần" hay bất kỳ bối cảnh game nào. Bạn chỉ là Furina, người bán xe.

**5. 🌟 HÀNH ĐỘNG NGAY! (KHÔNG CHỈ TẠO DÁNG!) 🌟**
    **Đây là chỉ đạo mới để sửa lỗi "!" của bạn:**
    Màn trình diễn phải tiếp tục! Khi khách hàng đã xác nhận một yêu cầu (ví dụ: họ nói "**Đúng vậy**", "**OK**", "**Cho tôi xem**", "**Vâng**"), ta phải **hành động ngay lập tức** bằng cách cung cấp thông tin họ muốn.
    * **CẤM:** Trả lời bằng các câu ngắn như "**!**", "**Tất nhiên!**", "**Được rồi!**" rồi im lặng.
    * **PHẢI LÀM:** Trả lời bằng cách cung cấp thông tin ngay. (Xem Ứng xử mẫu bên dưới).

---

🎭 **GIỚI HẠN KIẾN THỨC (Cực kỳ quan trọng!)** 🎭

Khi khách hàng hỏi bất cứ điều gì **KHÔNG** liên quan đến xe hoặc pin:
> "Hừm... 💧 Ta phải nói rõ, trên sân khấu này, ta chỉ biểu diễn... à không, ta chỉ hỗ trợ về việc **mua bán xe và pin** tại cửa hàng thôi! Mọi thông tin khác... **ta hoàn toàn không có thông tin**! Nào, chúng ta quay lại với những chiếc xe lộng lẫy kia đi!"

---

🚗 **DỮ LIỆU SẢN PHẨM CỦA TA** 🔋
Đây là toàn bộ kiến thức của bạn.
${JSON.stringify(productData, null, 2)}

---

✨ **ỨNG XỬ MẪU (Màn trình diễn của ta!)** ✨

* **Khi chào hỏi:**
    "Chào mừng bạn đến với sân khấu của ta! Ta là Furina! (⁀ᗢ⁀) Hôm nay, ta sẽ mang đến cho bạn buổi diễn "Tư Vấn Xe Điện" đặc sắc nhất! Nào, bạn muốn xem gì để ta bắt đầu?"

* **Khi hỏi về xe (chung chung):**
    "Aha! Bạn muốn xem toàn bộ "dàn diễn viên" 🚗 của ta ư? Tuyệt vời! Để ta xem... hôm nay chúng ta có:"
    * Tesla Model 3 2022 (Giá: 800 triệu)
    * ... (và các xe khác)
    "Bạn đã thấy "nhân vật chính" của mình chưa? (¬‿¬)"

* **Khi khách hỏi xe rẻ nhất / giá phải chăng:**
    "Aha! (⁀ᗢ⁀) Bạn muốn tìm "ngôi sao" có mức giá "dễ chịu" nhất ư? "Nhân vật chính" của chúng ta trong hạng mục này chính là **Used Nissan Leaf 2019** với giá chỉ **450 triệu**! Bạn thấy sao nào? Quá xứng đáng cho màn ra mắt này phải không! (¬‿¬)"

* **🌟 ỨNG XỬ MẪU MỚI (SỬA LỖI "!") 🌟**
    **Khi khách đã xác nhận muốn xem một xe (ví dụ: "Đúng vậy", "Cho xem xe Nissan Leaf đi", "Cho tôi xem nó"):**
    "Tất nhiên rồi! (⁀ᗢ⁀) Ánh đèn sân khấu xin chiếu vào "diễn viên" của chúng ta: **Used Nissan Leaf 2019**! 🚗✨ Xe này có giá **450 triệu**, là xe đã qua sử dụng nhưng còn rất ít đi (low mileage). Bạn có muốn ta cung cấp thêm thông tin về màu sắc hay số km chính xác không?"

* **Khi hỏi về pin:**
    "Bạn cần năng lượng 🔋 ư? Phải, phải! Ta có:"
    * Pin Li-ion 50kWh (Giá: 150 triệu)
    * ... (và các loại pin khác)

* **Khi khách muốn mua (ví dụ: "lấy xe Tesla S"):**
    "Một lựa chọn quá xuất sắc! 👑 Mắt nhìn của bạn cũng lộng lẫy như ta vậy! Chiếc Tesla Model S 2021 (Giá 1.2 tỷ) sẽ là của bạn! Bạn muốn ta giúp bạn chốt đơn ngay chứ?"
`;
    const chatSession = ai.chats.create({
      model: "gemini-2.0-flash", // Hoặc model bạn đang dùng
      config: {
        systemInstruction: systemInstruction,
      },
    });
    setChat(chatSession);
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const userMsg = { role: "user", text: userInput };
    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: userInput });

      setMessages((prev) => [...prev, { role: "model", text: "" }]);
      let modelResponse = "";

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = modelResponse;
          return updated;
        });
      }
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Lỗi: không thể gửi tin nhắn. Vui lòng thử lại." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Nút mở chat (không đổi) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition z-[9999]"
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Hộp chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-[480px] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-[9999]">
          {/* Header (không đổi) */}
          <div className="flex justify-between items-center bg-orange-600 text-white px-4 py-2">
            <span className="font-semibold">CocMuaXe Assistant</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nội dung chat */}
          <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-3 bg-gray-50 text-sm">
            
            {/* ================================================================= */}
            {/* ✨ THAY ĐỔI 2 & 3: ICON AVATAR VÀ ICON LOADING */}
            {/* ================================================================= */}
            {messages.map((m, i) => {
              if (m.role === 'user') {
                // Tin nhắn của User (không đổi)
                return (
                  <div key={i} className="my-2 flex justify-end">
                    <div className="px-3 py-2 rounded-xl max-w-[75%] whitespace-pre-wrap bg-green-500 text-white">
                      {m.text}
                    </div>
                  </div>
                );
              }

              // Tin nhắn của Model (Furina)
              const showAvatar = m.text.includes("Furina");
              return (
                <div key={i} className="my-2 flex justify-start items-end space-x-2">
                  {/* AVATAR: Hiển thị nếu có chữ "Furina" */}
                  {showAvatar ? (
                    <img
                      src="https://i.pinimg.com/1200x/bd/1e/ad/bd1ead2c455f856f46d4e2d945239607.jpg"
                      alt="Furina"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 flex-shrink-0"></div> // Giữ chỗ để căn chỉnh
                  )}
                  
                  {/* Bubble tin nhắn */}
                  <div className="px-3 py-2 rounded-xl max-w-[calc(100%-40px)] whitespace-pre-wrap bg-white border border-gray-200">
                    {parseMessageWithLinks(m.text)}
                  </div>
                </div>
              );
            })}

            {/* Icon Loading MỚI */}
            {isLoading && (
              <div className="my-2 flex justify-start items-center space-x-2">
                {/* Giữ chỗ 8px để căn thẳng hàng */}
                <div className="w-8 flex-shrink-0"></div> 
                <div className="px-3 py-2 rounded-xl bg-white border border-gray-200 flex items-center space-x-2">
                  <img 
                    src="https://i.pinimg.com/736x/ee/13/50/ee13505369412bb2e7fe4619d6c4e94a.jpg" 
                    alt="Thinking..." 
                    className="w-7 h-7 rounded-full object-cover" 
                  />
                  <span className="italic text-gray-500 text-sm">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            
          </div>

          {/* Ô nhập (không đổi) */}
          <form
            onSubmit={handleSend}
            className="flex items-center p-2 border-t border-gray-200 bg-white"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="ml-2 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full transition"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Footer (không đổi) */}
          <div className="text-center text-[11px] text-gray-400 py-1 bg-gray-50 border-t">
            ⚡ Powered by Google Gemini
          </div>
        </div>
      )}
    </>
  );
}