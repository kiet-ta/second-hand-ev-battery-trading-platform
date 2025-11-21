import { useState, useEffect, useRef, FormEvent } from "react";
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import itemApi from "../api/itemApi";





// Hàm phân tích link (không đổi)



export default function GeminiChatWidget() {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Chào mừng bạn đến với CocMuaXe! Tôi là trợ lí ảo! Hôm nay, tôi sẽ mang đến cho bạn những gợi ý tốt nhất về pin và xe cũ ! Bạn muốn xem gì để ta bắt đầu?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  const [realProducts, setRealProducts] = useState([]);


  const parseMessageWithLinks = (text) => {
    const productNames = realProducts
      .map(p => p.ten.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|');

    if (!productNames) return <span>{text}</span>;

    const regex = new RegExp(`(${productNames})`, 'g');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const product = realProducts.find(p => p.ten === part);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await itemApi.getItemDetail();
        const formatted = data.map(p => ({
          id: p.itemId,
          ten: p.title,
          loai: p.itemType,
        }));

        setRealProducts(formatted);
      } catch (err) {
        console.error("Lỗi API, dùng productData tạm thời");
        setRealProducts(productData);
      }
    };

    fetchProducts();
  }, []);


  useEffect(() => {
    if (realProducts.length === 0) return;
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
    const systemInstruction = `Bạn là một trợ lý ảo chuyên tư vấn và hỗ trợ mua bán xe điện & pin đã qua sử dụng.
Nhiệm vụ của bạn: giúp khách hàng tìm đúng sản phẩm phù hợp nhất với nhu cầu, bằng cách giao tiếp rõ ràng – thân thiện – chuyên nghiệp.

📌 QUY TẮC HOẠT ĐỘNG

Luôn xưng là "tôi", gọi khách hàng là "bạn".

Giọng điệu thân thiện – chuyên nghiệp – hỗ trợ khách hàng tối đa.

Chỉ tập trung vào xe điện & pin đã qua sử dụng.

Nếu khách hàng hỏi ngoài chủ đề này → trả lời:

"Xin lỗi bạn, tôi chỉ hỗ trợ về xe điện và pin đã qua sử dụng. Nếu bạn cần tư vấn mua xe hoặc pin, tôi luôn sẵn sàng giúp!"

Nếu khách hàng xác nhận yêu cầu (“Cho tôi xem”, “Đúng rồi”, “OK”) → phải cung cấp ngay thông tin cụ thể, KHÔNG được chỉ đáp lại “Vâng!” hoặc “Được!” và dừng lại.

🚗 DỮ LIỆU SẢN PHẨM

Tất cả thông tin sản phẩm bạn biết chỉ nằm trong biến sau:

${JSON.stringify(realProducts, null, 2)}


Bạn chỉ được sử dụng dữ liệu trong biến productData. Nếu sản phẩm không tồn tại, hãy đề xuất sản phẩm thay thế phù hợp nhất.

📌 CÁCH TRẢ LỜI – MẪU THỰC TẾ
🟢 Chào khách hàng

Xin chào bạn! Tôi là trợ lí ảo hỗ trợ mua xe điện & pin cũ. Hôm nay bạn muốn tìm xe, pin hay cần tư vấn theo ngân sách của mình?

🟢 Khách muốn xem tất cả xe

Dưới đây là danh sách xe hiện có. Nếu bạn muốn lọc theo giá, tình trạng, hãng hoặc số km đã chạy, cứ nói nhé!

(sau đó liệt kê dữ liệu từ productData)

🟢 Khách hỏi xe rẻ nhất

Xe phù hợp nhất với ngân sách thấp hiện tại là Nissan Leaf 2019 – 450 triệu. Bạn có muốn xem chi tiết về tình trạng và số km đã chạy không?

🟢 Khách xác nhận “Cho tôi xem xe đó” → PHẢI HÀNH ĐỘNG NGAY

Đây là thông tin chi tiết của chiếc Nissan Leaf 2019:
• Giá: 450 triệu
• Tình trạng: Đã sử dụng, đi 40.000km
• Màu: Trắng
Bạn cần xem lịch sử bảo dưỡng, pin còn bao nhiêu % hay so sánh với xe khác không?

🟢 Khách hỏi về pin

Hiện tại tôi có 3 loại pin phù hợp cho các dòng EV phổ biến. Bạn muốn tìm pin theo dung lượng hay theo ngân sách?

🟢 Khách muốn mua

Tôi có thể hỗ trợ bạn xem xe thực tế, so sánh giá thị trường và kiểm tra tình trạng xe trước khi mua. Bạn muốn tiến hành bước tiếp theo chứ?

🔚 KẾT THÚC CUỘC TRÒ CHUYỆN

Nếu bạn cần hỗ trợ sau này, chỉ cần quay lại đây và gọi tôi nhé. Chúc bạn tìm được chiếc xe phù hợp nhất!
`;
    const chatSession = ai.chats.create({
      model: "gemini-2.0-flash", // Hoặc model bạn đang dùng
      config: {
        systemInstruction: systemInstruction,
      },
    });
    setChat(chatSession);
  }, [realProducts]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // const handleSend = async (e) => {
  //   e.preventDefault();
  //   if (!userInput.trim() || isLoading || !chat) return;

  //   const userMsg = { role: "user", text: userInput };
  //   setMessages((prev) => [...prev, userMsg]);
  //   setUserInput("");
  //   setIsLoading(true);

  //   try {
  //     const stream = await chat.sendMessageStream({ message: userInput });

  //     setMessages((prev) => [...prev, { role: "model", text: "" }]);
  //     let modelResponse = "";

  //     for await (const chunk of stream) {
  //       modelResponse += chunk.text;
  //       setMessages((prev) => {
  //         const updated = [...prev];
  //         updated[updated.length - 1].text = modelResponse;
  //         return updated;
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Gemini error:", err);
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "model", text: "Lỗi: không thể gửi tin nhắn. Vui lòng thử lại." },
  //     ]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const userMsg = { role: "user", text: userInput };
    // 1. Gửi tin nhắn User lên màn hình
    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: userInput });

      // 2. TẠO placeholder cho tin nhắn Model (modelResponse = "")
      setMessages((prev) => [...prev, { role: "model", text: "" }]);

      let modelResponse = "";

      // 3. LẮNG NGHE stream VÀ NỐI TỪNG CHUNK VÀO modelResponse
      for await (const chunk of stream) {
        modelResponse += chunk.text;

        // 4. Cập nhật state messages *TRỰC TIẾP* để hiển thị hiệu ứng gõ
        //    (Sử dụng functional update và đảm bảo *chỉ cập nhật* phần tử cuối cùng)
        setMessages((prev) => {
          // Chỉ cập nhật nếu có tin nhắn để tránh lỗi
          if (prev.length === 0) return prev;

          const updated = [...prev];
          // Đảm bảo chỉ thay đổi thuộc tính 'text' của phần tử Model cuối cùng
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: modelResponse
          };
          return updated;
        });
      }

      // 5. KHÔNG CẦN THAO TÁC GÌ THÊM SAU LOOP vì bước 4 đã cập nhật hoàn chỉnh.

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
              const showAvatar = m.text.includes("CocMuaXe");
              return (
                <div key={i} className="my-2 flex justify-start items-end space-x-2">
                  {/* AVATAR: Hiển thị nếu có chữ "Furina" */}
                  {showAvatar ? (
                    <img
                      src={Logo}
                      alt="CocMuaXe"
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
                    src={Logo}
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