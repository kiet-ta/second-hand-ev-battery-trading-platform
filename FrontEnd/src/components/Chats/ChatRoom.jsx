import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import chatApi from "../../api/chatApi";
import useSignalR from "../../hooks/useSignalR";
import { Spin } from "antd";
import userApi from "../../api/userApi";
import notificationApi from "../../api/notificationApi";
import complaintApi from "../../api/complaintApi";
import NotificationToast from "../Notifications/NotificationToast";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "https://localhost:7000/";
const CHAT_HUB_URL = `${API_BASE_URL}chatHub`;

const formatTime = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date)) return isoString;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function ChatRoom({ currentUserId, initialRoomId }) {
  const loggedInUserId = parseInt(currentUserId, 10) || 1;

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerProfiles, setPartnerProfiles] = useState({});
  const [chatPartner, setChatPartner] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState([]);
  const { connection, isConnected } = useSignalR(CHAT_HUB_URL);
  const messagesEndRef = useRef(null);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((content, type = "success") => {
    setToast({ id: Date.now(), content, type });
  }, []);

  // Image modal state
  const [imageModal, setImageModal] = useState({ urls: [], currentIndex: 0 });

  const currentRoomRef = useRef(currentRoom);
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Fetch partner profiles
  const fetchPartnerProfiles = useCallback(
    async (roomList) => {
      const uniquePartnerIds = new Set();
      roomList.forEach((room) => {
        const partnerId = room.members.find((id) => id !== loggedInUserId);
        if (partnerId) uniquePartnerIds.add(partnerId);
      });

      const newProfiles = {};
      for (const id of Array.from(uniquePartnerIds)) {
        try {
          const profile = await userApi.getUserByID(id);
          newProfiles[id] = profile;
        } catch {
          newProfiles[id] = {
            fullName: `User ${id}`,
            avatarProfile: "/default-avatar.png",
          };
        }
      }
      setPartnerProfiles(newProfiles);
    },
    [loggedInUserId]
  );

  const handleRoomSelect = useCallback(
    async (cid) => {
      try {
        const roomData = await chatApi.getChatByID(cid);
        setCurrentRoom(roomData);
        setMessages(
          roomData.messages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          )
        );

        const partnerId = roomData.members.find((id) => id !== loggedInUserId);
        if (partnerId) {
          const partnerProfile = await userApi.getUserByID(partnerId);
          setChatPartner(partnerProfile);
        }
      } catch (error) {
        console.error("Failed to load room:", error);
        setChatPartner(null);
      }
    },
    [loggedInUserId]
  );

  const fetchRooms = useCallback(async () => {
    try {
      const fetchedRooms = await chatApi.getRoomByUserIDs(loggedInUserId);
      setRooms(fetchedRooms);
      await fetchPartnerProfiles(fetchedRooms);
      const roomToLoadCid =
        initialRoomId || (fetchedRooms.length > 0 ? fetchedRooms[0].cid : null);
      if (roomToLoadCid) await handleRoomSelect(roomToLoadCid);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  }, [loggedInUserId, initialRoomId, fetchPartnerProfiles, handleRoomSelect]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uploadingImages]);

  // SignalR message listener
  useEffect(() => {
    if (!connection) return;
    const handler = (cid, messageDto) => {
      if (cid === currentRoomRef.current?.cid) {
        setMessages((prev) => [...prev, messageDto]);
      }
    };
    connection.on("ReceiveMessage", handler);
    return () => connection.off("ReceiveMessage", handler);
  }, [connection]);

  // Notification cooldown
  const lastNotiTimeRef = useRef({});
  const sendChatNotification = useCallback(
    async (receiverId, message) => {
      if (!receiverId || !message || receiverId === loggedInUserId) return;
      const now = Date.now();
      const cooldown = 10000;
      const lastSent = lastNotiTimeRef.current[receiverId] || 0;
      if (now - lastSent < cooldown) return;
      lastNotiTimeRef.current[receiverId] = now;

      try {
        await notificationApi.createNotification({
          notiType: "activities",
          senderId: loggedInUserId,
          senderRole: "manager",
          title: "💬 Tin nhắn mới",
          message: `Bạn có tin nhắn: "${message.slice(0, 50)}${
            message.length > 50 ? "..." : ""
          }"`,
          targetUserId: receiverId.toString(),
        });
      } catch (err) {
        console.error("Failed to send notification:", err);
      }
    },
    [loggedInUserId]
  );

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput || !currentRoom || !isConnected) return;

    const cid = currentRoom.cid;
    const to = currentRoom.members.find((id) => id !== loggedInUserId);
    if (!to) return;

    try {
      await connection.invoke("SendMessage", cid, to, messageInput);
      sendChatNotification(to, messageInput);
      showToast("Đã gửi tin nhắn!", "success");
      setMessageInput("");
    } catch (err) {
      showToast("Gửi tin nhắn thất bại!", "error");
      console.error(err);
    }
  };

  // Multi-image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !currentRoom) return;

    const tempImages = files.map(file => ({
      id: Date.now() + Math.random(),
      from: loggedInUserId,
      type: "image",
      text: "",
      imageUrl: URL.createObjectURL(file),
      isLoading: true,
      file
    }));

    setUploadingImages(prev => [...prev, ...tempImages]);

    for (const img of tempImages) {
      try {
        const uploadedUrl = await uploadToCloudinary(img.file);
        const cid = currentRoom.cid;
        const to = currentRoom.members.find(id => id !== loggedInUserId);
        await connection.invoke("SendMessage", cid, to, uploadedUrl);
        sendChatNotification(to, "📷 Hình ảnh mới");
        showToast("Ảnh đã được gửi!", "success");
      } catch (err) {
        showToast("Tải ảnh thất bại!", "error");
        console.error(err);
      } finally {
        setUploadingImages(prev =>
          prev.filter(u => u.id !== img.id)
        );
      }
    }
  };

  // Report chat message/item
  const reportChat = async (msg) => {
    if (!currentRoom) return;
    const partnerId = currentRoom.members.find(id => id !== loggedInUserId);
    const description = `
Chat Room ID: ${currentRoom.cid}
From User: ${msg.from}
To User: ${partnerId}
Message ID: ${msg.id || msg.tempId}
Message Content: ${msg.text || "Image/Item"}
Created At: ${msg.createdAt || new Date().toISOString()}
`;
    try {
      await complaintApi.createComplaint({
        reason: "Inappropriate content",
        description,
        status: "pending",
        severityLevel: "medium",
        isDeleted: false,
      });
      showToast("Đã gửi báo cáo!", "success");
    } catch (err) {
      console.error(err);
      showToast("Báo cáo thất bại!", "error");
    }
  };

  const chatPartnerId = currentRoom?.members.find((id) => id !== loggedInUserId);
  const partnerName = chatPartner?.fullName || `User ${chatPartnerId || "..."}`;
  const partnerAvatar =
    chatPartner?.avatarProfile ||
    "https://i.pinimg.com/736x/0b/4b/69/0b4b69fdcd89a4cd3c632e45e88a510a.jpg";

  // Image modal keyboard navigation
  useEffect(() => {
    if (imageModal.urls.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setImageModal({ urls: [], currentIndex: 0 });
      } else if (e.key === "ArrowLeft") {
        setImageModal(prev => ({
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.urls.length) % prev.urls.length
        }));
      } else if (e.key === "ArrowRight") {
        setImageModal(prev => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.urls.length
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageModal.urls]);

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px] bg-gray-50">
        <Spin tip="Connecting to Chat Server..." size="large" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-row h-full w-full bg-white shadow-xl rounded-lg">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <p className="text-lg font-bold">Your Chats ({rooms.length})</p>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isConnected ? "Online" : "Reconnecting"}
          </span>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto">
          {rooms.map((room) => {
            const otherMemberId = room.members.find(
              (id) => id !== loggedInUserId
            );
            const profile =
              partnerProfiles[otherMemberId] || {
                fullName: `User ${otherMemberId}`,
                avatarProfile: "/default-avatar.png",
              };
            return (
              <div
                key={room.cid}
                onClick={() => handleRoomSelect(room.cid)}
                className={`flex items-center p-3 space-x-3 rounded-xl cursor-pointer transition ${
                  currentRoom?.cid === room.cid
                    ? "bg-indigo-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <img
                  src={profile.avatarProfile}
                  alt={profile.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {profile.fullName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Room: {room.cid}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 h-screen w-3/4 p-4">
        {currentRoom ? (
          <>
            <div className="flex items-center gap-3 mb-4 border-b pb-2">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-10 h-10 rounded-full"
              />
              <h3 className="text-xl font-bold text-indigo-600">{partnerName}</h3>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-3 rounded-lg mb-4">
              {[...messages, ...uploadingImages].map((msg) => {
                const isMyMessage = msg.from === loggedInUserId;
                const isImage = msg.text?.startsWith("http") && msg.type !== "item";
                const isLoading = msg.isLoading;

                // --- parse item card ---
                let itemData = null;
                try {
                  const parsed = JSON.parse(msg.text);
                  if (parsed.type === "ev") itemData = parsed;
                } catch {}

                if (itemData) {
                  return (
                    <div
                      key={msg.id || msg.tempId}
                      className="flex justify-center my-4 relative group"
                    >
                      <Link
                        to={`/ev/${itemData.itemId}`}
                        className="w-full max-w-md cursor-pointer"
                        state={itemData.itemId}
                      >
                        <div className="bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl p-4 flex flex-col items-center transition relative">
                          <img
                            src={itemData.imageUrl}
                            alt={itemData.title}
                            className="w-48 h-48 object-cover rounded-lg mb-4"
                          />
                          <p className="font-bold text-lg text-gray-800">{itemData.title}</p>
                          {itemData.note && (
                            <p className="text-sm text-gray-500 my-1 text-center">{itemData.note}</p>
                          )}
                          <p className="text-indigo-600 font-bold text-lg mt-2">
                            {itemData.price?.toLocaleString("vi-VN")}₫
                          </p>

                          {/* Report button */}
                          <button
                            onClick={() => reportChat(msg)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 text-sm font-bold"
                            title="Report this item"
                          >
                            !
                          </button>
                        </div>
                      </Link>
                    </div>
                  );
                }

                // --- normal message bubble ---
                return (
                  <div
                    key={msg.id || msg.tempId}
                    className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-xl text-sm relative group ${
                        isMyMessage
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-gray-300 rounded-bl-none"
                      }`}
                      title="Hover to report"
                    >
                      {isImage ? (
                        <div className="relative">
                          <img
                            src={msg.imageUrl || msg.text}
                            alt="sent"
                            className="rounded-lg max-h-30 object-cover bg-white cursor-pointer"
                            onClick={() => {
                              const allImages = [...messages, ...uploadingImages]
                                .filter(m => m.type === "image")
                                .map(m => m.imageUrl || m.text);
                              const currentIndex = allImages.indexOf(msg.imageUrl || msg.text);
                              setImageModal({ urls: allImages, currentIndex });
                            }}
                          />
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg text-sm text-gray-600">
                              Đang tải ảnh...
                            </div>
                          )}
                        </div>
                      ) : (
                        msg.text
                      )}

                      {/* Timestamp */}
                      {!isLoading && (
                        <div
                          className={`text-xs mt-1 ${
                            isMyMessage ? "text-right text-gray-300" : "text-left text-gray-500"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </div>
                      )}

                      {/* Report button */}
                      <button
                        onClick={() => reportChat(msg)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 text-2xl font-bold"
                        title="Report this message"
                      >
                        !
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t pt-2"
            >
              <label className="cursor-pointer text-indigo-600 text-xl">
                📷
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-grow p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!messageInput}
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Chọn cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal.urls.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <button
            className="absolute top-5 right-5 text-white text-2xl"
            onClick={() => setImageModal({ urls: [], currentIndex: 0 })}
          >
            ✕
          </button>
          <button
            className="absolute left-5 text-white text-3xl"
            onClick={() =>
              setImageModal(prev => ({
                ...prev,
                currentIndex: (prev.currentIndex - 1 + prev.urls.length) % prev.urls.length
              }))
            }
          >
            ‹
          </button>
          <img
            src={imageModal.urls[imageModal.currentIndex]}
            alt="preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
          />
          <button
            className="absolute right-5 bottom-5 text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700"
            onClick={(e) => {
              e.stopPropagation();
              const url = imageModal.urls[imageModal.currentIndex];
              const link = document.createElement("a");
              link.href = url;
              link.download = "image.jpg";
              link.click();
            }}
          >
            ⬇️ Download
          </button>
          <button
            className="absolute right-20 bottom-5 text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            onClick={() => {
              const currentMsg = [...messages, ...uploadingImages].find(
                m => (m.imageUrl || m.text) === imageModal.urls[imageModal.currentIndex]
              );
              if (currentMsg) reportChat(currentMsg);
            }}
          >
            !
          </button>
        </div>
      )}

      {/* Toast overlay */}
      {toast && (
        <div className="absolute top-5 right-5 z-50">
          <NotificationToast
            notification={toast}
            onClose={() => setToast(null)}
            duration={3000}
          />
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
