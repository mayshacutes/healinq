"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

// Komponen inner yang pakai useChat
function ChatRoom({ roomId, currentUserId, counselorName }) {
  const { messages, loading, sendMessage } = useChat(roomId);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, currentUserId);
    setInput("");
  };

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
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-10">
            Belum ada pesan. Mulai percakapan dengan konselor!
          </p>
        )}
        {messages.map((msg) => {
          const isSelf = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
              {!isSelf && (
                <div className="w-8 h-8 rounded-full bg-[#0C72A6] flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
                  K
                </div>
              )}
              <div className={`max-w-[65%] px-4 py-2 rounded-2xl ${
                isSelf ? "bg-[#0C72A6] text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
              }`}>
                <p className="text-sm break-words">{msg.message}</p>
                <p className={`text-[10px] mt-1 text-right ${isSelf ? "text-blue-200" : "text-gray-400"}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* QUICK REPLIES */}
      <div className="px-6 pb-2 flex gap-2 flex-wrap">
        {quickReplies.map((q, i) => (
          <button key={i} onClick={() => setInput(q)}
            className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-50">
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t flex gap-3 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tulis pesan..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button onClick={handleSend}
          className="bg-[#0C72A6] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#095f8c]">
          Kirim
        </button>
      </div>
    </>
  );
}

export default function UserChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const bookingCode = searchParams.get("bookingCode");

  const [currentUser, setCurrentUser] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      if (!roomId) {
        setErrorMessage("Room ID tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      // Ambil user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Kamu harus login terlebih dahulu.");
        setIsLoading(false);
        return;
      }
      setCurrentUser(user);

      // Ambil info consultation dari booking code
      if (bookingCode) {
        const { data } = await supabase
          .from("consultations")
          .select("counselor_name, consultation_date, consultation_hour, consultation_type, session_duration, topic")
          .eq("booking_code", bookingCode)
          .maybeSingle();
        if (data) setConsultation(data);
      }

      setIsLoading(false);
    };

    init();
  }, [roomId, bookingCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#d4effc] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
      </div>
    );
  }

  if (errorMessage || !roomId) {
    return (
      <div className="min-h-screen bg-[#d4effc] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center w-[400px]">
          <p className="text-lg font-bold text-red-500">{errorMessage || "Room tidak ditemukan"}</p>
          <button onClick={() => router.push("/consultation/my-bookings")}
            className="mt-5 bg-[#0C72A6] text-white px-6 py-2 rounded-full">
            Kembali ke My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#d4effc]">
      {/* HEADER */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <BackIconButton to="/consultation/my-bookings" />
        <div>
          <p className="font-bold text-[#0C72A6]">
            {consultation?.counselor_name || "Konselor"}
          </p>
          {consultation && (
            <p className="text-xs text-gray-400">
              {consultation.consultation_date} · {consultation.consultation_hour} WIB ·{" "}
              <span className="capitalize">{consultation.consultation_type}</span>
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          <span className="text-xs text-green-500 font-medium">Sesi Berlangsung</span>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentUser && (
          <ChatRoom
            roomId={roomId}
            currentUserId={currentUser.id}
            counselorName={consultation?.counselor_name}
          />
        )}
      </div>
    </div>
  );
}