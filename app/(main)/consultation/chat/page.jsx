"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";
import { useChat } from "@/lib/useChat";

const quickReplies = [
  "Saya butuh bantuan",
  "Saya sedang cemas",
  "Boleh konsultasi?",
];

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// Komponen inner yang pakai useChat
function ChatRoom({ roomId, currentUserId, counselorName }) {
  const { messages, loading, sendMessage } = useChat(roomId);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUserId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, currentUserId);
    setInput("");
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f4fd] flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#0C72A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Belum ada pesan</p>
            <p className="text-gray-300 text-xs mt-1">Mulai percakapan dengan {counselorName || "konselor"}!</p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                {formatDateLabel(msgs[0].created_at)}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
            {msgs.map((msg) => {
              const isSelf = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-2 ${isSelf ? "justify-end" : "justify-start"} animate-fade-in`}
                  style={{ animationDelay: "0s" }}
                >
                  {!isSelf && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      {counselorName?.charAt(0) || "K"}
                    </div>
                  )}
                  <div className={`max-w-[70%] sm:max-w-[60%] ${isSelf ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isSelf
                        ? "bg-gradient-to-br from-[#0C72A6] to-[#095f8c] text-white rounded-2xl rounded-br-sm shadow-sm"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100"
                    }`}>
                      <p className="break-words">{msg.message}</p>
                    </div>
                    <span className={`text-[10px] mt-1 ${isSelf ? "text-right text-blue-300" : "text-left text-gray-400"}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  {isSelf && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      {currentUserId?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* QUICK REPLIES */}
      <div className="px-4 sm:px-6 pb-2 flex gap-2 flex-wrap">
        {quickReplies.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="bg-white border border-pink-200 px-4 py-1.5 rounded-full text-xs text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition font-medium shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="px-4 sm:px-6 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-3 items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200 focus-within:border-[#0C72A6] focus-within:shadow-sm transition">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tulis pesan..."
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-[#0C72A6] to-[#095f8c] text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default function UserChatPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState(null);
  const [bookingCode, setBookingCode] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [actualUserId, setActualUserId] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const roomIdFromUrl = params.get("roomId");
  const bookingCodeFromUrl = params.get("bookingCode");

  setRoomId(roomIdFromUrl);
  setBookingCode(bookingCodeFromUrl);

  const init = async () => {
    setIsLoading(true);

    if (!roomIdFromUrl) {
      setErrorMessage("Room ID tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Kamu harus login terlebih dahulu.");
      setIsLoading(false);
      return;
    }
    setCurrentUser(user);

    let clientId = null;

    if (bookingCodeFromUrl) {
      const { data } = await supabase
        .from("consultations")
        .select("counselor_name, consultation_date, consultation_hour, consultation_type, session_duration, topic, client_id")
        .eq("booking_code", bookingCodeFromUrl)
        .maybeSingle();
      if (data) {
        const start = new Date(`${data.consultation_date}T${data.consultation_hour?.replace(".", ":")}:00`);
        const end = new Date(start.getTime() + (data.session_duration || 60) * 60000);
        const now = new Date();
        if (now < start || now > end) {
          setErrorMessage("Room chat hanya bisa dibuka selama sesi konsultasi berlangsung.");
          setIsLoading(false);
          return;
        }
        clientId = data.client_id;
        setConsultation(data);
      }
    } else {
      const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("id, consultation_id")
        .eq("id", roomIdFromUrl)
        .maybeSingle();

      if (roomData?.consultation_id) {
        const { data } = await supabase
          .from("consultations")
          .select("counselor_name, consultation_date, consultation_hour, consultation_type, session_duration, topic, client_id")
          .eq("id", roomData.consultation_id)
          .maybeSingle();
        if (data) {
          clientId = data.client_id;
          setConsultation(data);
        }
      }
    }

    setActualUserId(clientId || user.id);

    setIsLoading(false);
  };

  init();
}, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d4effc] to-[#e8f4fd] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
          <p className="text-sm text-[#0C72A6] font-medium">Memuat chat...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d4effc] to-[#e8f4fd] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.12)] text-center max-w-[400px] w-full">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-base font-bold text-red-500">{errorMessage || "Room tidak ditemukan"}</p>
          <button onClick={() => router.push("/consultation/my-bookings")}
            className="mt-5 bg-gradient-to-r from-[#0C72A6] to-[#095f8c] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:shadow-md transition">
            Kembali ke My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#d4effc] to-[#e8f4fd]">
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center gap-3 shadow-sm">
        <BackIconButton to="/consultation/my-bookings" />
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
          {consultation?.counselor_name?.charAt(0) || "K"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0C72A6] text-sm truncate">
            {consultation?.counselor_name || "Konselor"}
          </p>
          {consultation && (
            <p className="text-[11px] text-gray-400 truncate">
              {consultation.consultation_date} · {consultation.consultation_hour} WIB
              <span className="capitalize"> · {consultation.consultation_type}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-[11px] text-green-600 font-medium">Sesi Berlangsung</span>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentUser && actualUserId && (
          <ChatRoom
            roomId={roomId}
            currentUserId={actualUserId}
            counselorName={consultation?.counselor_name}
          />
        )}
      </div>
    </div>
  );
}