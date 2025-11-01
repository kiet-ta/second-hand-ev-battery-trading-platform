import { useState, useEffect, useRef, FormEvent } from "react";
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send } from "lucide-react";

export default function GeminiChatWidget() {
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "👋 Xin chào! Mình là trợ lý AI của nền tảng **CocMuaXe** — nơi bạn có thể mua, bán, hoặc đấu giá xe điện và pin cũ. Mình có thể giúp gì cho bạn hôm nay?",
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
        const chatSession = ai.chats.create({
            model: "gemini-2.0-flash",
            config: {
                systemInstruction: `
                    Bạn là trợ lý AI thân thiện cho nền tảng **EV & Battery Trading Platform (CocMuaXe)**.
                    Nhiệm vụ của bạn là giúp người dùng:
                    - Tìm hiểu thông tin về xe điện, pin, và quy trình mua bán hoặc đấu giá.
                    - Hướng dẫn thao tác trên website (đăng xe, tham gia đấu giá, xem đơn hàng, v.v.).
                    - Giải thích rõ ràng, dễ hiểu, ngắn gọn, luôn bằng **tiếng Việt**.

                    💬 Phong cách:
                    - Xưng hô “mình – bạn” cho thân thiện.
                    - Luôn nói giọng tự nhiên, tích cực, không quá dài dòng.
                    - Nếu không biết câu trả lời, hãy nói: “Xin lỗi, mình chưa có thông tin đó.”

                    ⚙️ Ứng xử mẫu:
                    - Khi người dùng hỏi “bạn là ai?” → trả lời: 
                      “Mình là trợ lý AI của nền tảng CocMuaXe, giúp bạn mua bán và đấu giá xe điện hoặc pin nhanh chóng, dễ dàng.”
                    - Khi người dùng hỏi “làm sao để đăng xe?” → trả lời:
                      “Bạn chỉ cần vào trang Seller Dashboard → chọn ‘Đăng sản phẩm mới’ → nhập thông tin xe, hình ảnh, giá → gửi duyệt để Staff kiểm tra.”
                    - Khi người dùng hỏi “đấu giá hoạt động thế nào?” → trả lời:
                      “Người bán tạo phiên đấu giá, người mua đặt giá trong thời gian quy định. Khi kết thúc, người đặt giá cao nhất sẽ thắng.”
                `,
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

            // Placeholder tin nhắn của AI
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
            {/* Nút mở chat */}
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
                    {/* Header */}
                    <div className="flex justify-between items-center bg-orange-600 text-white px-4 py-2">
                        <span className="font-semibold">CocMuaXe Assistant</span>
                        <button onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nội dung chat */}
                    <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-3 bg-gray-50 text-sm">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`my-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-xl max-w-[75%] ${m.role === "user"
                                        ? "bg-green-500 text-white"
                                        : "bg-white border border-gray-200"
                                        }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <p className="italic text-gray-400 text-center">💭 Gemini đang soạn câu trả lời...</p>
                        )}
                    </div>

                    {/* Ô nhập */}
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

                    {/* Footer */}
                    <div className="text-center text-[11px] text-gray-400 py-1 bg-gray-50 border-t">
                        ⚡ Powered by Google Gemini
                    </div>
                </div>
            )}
        </>
    );
}
