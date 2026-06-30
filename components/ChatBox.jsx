"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/lib/useChat";
import { getBookingStatus, getCountdown, formatSchedule, BOOKING_STATUS } from "@/lib/bookingUtils";

const QUICK_REPLIES = ["Saya butuh bantuan", "Saya sedang cemas", "Boleh konsultasi?"];

export default function ChatBox({ roomId, currentUserId, consultation }) {
  const { messages, loading, sendMessage, markAsRead } = useChat(roomId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState("");
  const bottomRef = useRef(null);

  const status = consultation
    ? getBookingStatus(
        consultation.consultation_date,
        consultation.consultation_hour,
        consultation.session_duration
      )
    : null;

  const isRoomOpen = status === BOOKING_STATUS.ACTIVE;

  // Countdown timer
  useEffect(() => {
    if (status !== BOOKING_STATUS.NOT_STARTED) return;

    const interval = setInterval(() => {
      const c = getCountdown(consultation.consultation_date, consultation.consultation_hour);
      if (!c) { clearInterval(interval); return; }
      setCountdown(c);
    }, 1000);

    // Set langsung sekali
    setCountdown(getCountdown(consultation.consultation_date, consultation.consultation_hour) || "");

    return () => clearInterval(interval);
  }, [consultation, status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (roomId && currentUserId) markAsRead(currentUserId);
  }, [roomId, currentUserId]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || sending || !isRoomOpen) return;
    setSending(true);
    await sendMessage(msg, currentUserId);
    setInput("");
    setSending(false);
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const formatDateLabel = (ts) =>
    new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const otherName = consultation?.counselor_name || consultation?.client_name || "—";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b bg-white">
        <div>
          <h2 className="font-semibold text-gray-800">{otherName}</h2>
          <p className={`text-xs font-medium ${
            status === BOOKING_STATUS.ACTIVE ? "text-green-500" :
            status === BOOKING_STATUS.NOT_STARTED ? "text-yellow-500" : "text-red-400"
          }`}>
            {status === BOOKING_STATUS.ACTIVE ? "Active" :
             status === BOOKING_STATUS.NOT_STARTED ? "Not Started" : "Expired"}
          </p>
          {consultation?.booking_code && (
            <p className="text-xs text-gray-400">Booking Code: {consultation.booking_code}</p>
          )}
        </div>

        {status === BOOKING_STATUS.NOT_STARTED && countdown && (
          <div className="text-right">
            <p className="text-sm font-semibold text-pink-500">{countdown}</p>
            <p className="text-xs text-gray-400">
              {formatSchedule(consultation.consultation_date, consultation.consultation_hour)}
            </p>
          </div>
        )}
      </div>

      {/* Banner */}
      {!isRoomOpen && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <p className="text-xs text-yellow-700 text-center">
            {status === BOOKING_STATUS.NOT_STARTED
              ? "Room chat belum dibuka. Chat baru bisa digunakan sesuai jadwal konsultasi."
              : "Sesi konsultasi telah berakhir."}
          </p>
        </div>
      )}

      {/* Pesan */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-blue-50/30">
        {loading && <p className="text-center text-gray-400 text-sm">Memuat chat...</p>}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{formatDateLabel(msgs[0].created_at)}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-2">
              {msgs.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatTime(msg.created_at)}
                        {isMe && <span className="ml-1 text-blue-400">{msg.is_read ? "✓✓" : "✓"}</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      {isRoomOpen && (
        <div className="flex gap-2 px-4 py-2 bg-white border-t overflow-x-auto">
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr}
              onClick={() => handleSend(qr)}
              className="whitespace-nowrap text-xs border border-gray-300 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-t">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <input
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 disabled:cursor-not-allowed"
          placeholder={isRoomOpen ? "Ketik pesan..." : "Room chat belum dibuka"}
          value={input}
          disabled={!isRoomOpen}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={() => handleSend()}
          disabled={!isRoomOpen || !input.trim() || sending}
          className="text-sm font-medium text-blue-500 disabled:text-gray-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}