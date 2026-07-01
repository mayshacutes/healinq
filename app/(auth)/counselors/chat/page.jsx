"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCounselorConsultations } from "@/lib/chatRooms";
import { useChat } from "@/lib/useChat";

const quickReplies = [
  "Terima kasih sudah berbagi 🙏",
  "Bisa diceritakan lebih lanjut?",
  "Mari kita tarik napas perlahan",
];

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d) {
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

function getSessionStatus(consultation) {
  const start = new Date(`${consultation.consultation_date}T${consultation.consultation_hour?.replace(".", ":")}:00`);
  const end = new Date(start.getTime() + (consultation.session_duration || 60) * 60000);
  const now = new Date();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "finished";
}

// Komponen chat yang pakai useChat hook
function ChatArea({ roomId, currentUserId, patientName }) {
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-10">Belum ada pesan.</p>
        )}
        {messages.map((msg) => {
          const isCounselor = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[65%] ${isCounselor ? "bg-pink-300" : "bg-white"}`}>
                <p className="text-sm break-words">{msg.message}</p>
                <p className="text-[10px] text-gray-500 text-right mt-1">{formatTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* QUICK REPLY */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {quickReplies.map((q, i) => (
          <button key={i} onClick={() => setInput(q)}
            className="bg-gray-200 px-3 py-1 rounded-full text-xs hover:bg-gray-300">
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white flex gap-2 border-t">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tulis pesan..."
          className="flex-1 p-2 rounded-lg bg-gray-100 text-sm outline-none" />
        <button onClick={handleSend}
          className="bg-pink-500 text-white px-4 rounded-lg text-sm font-medium">
          Kirim
        </button>
      </div>
    </>
  );
}

export default function CounselorChatPage() {
  const [counselor, setCounselor] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      // Ambil data counselor by email
      const { data: counselorData } = await supabase
        .from("counselors")
        .select("id, name, email")
        .eq("email", user.email)
        .maybeSingle();

      if (!counselorData) { setIsLoading(false); return; }
      setCounselor({ ...counselorData, authId: user.id });

      // Ambil semua consultasi milik counselor ini
      const data = await getCounselorConsultations(counselorData.id);
      setConsultations(data || []);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectConsultation = async (consultation) => {
    setSelectedConsultation(consultation);
    setSelectedRoomId(null);

    // Ambil room_id dari chat_rooms
    const roomId = consultation.chat_rooms?.[0]?.id;
    if (roomId) {
      setSelectedRoomId(roomId);
    } else {
      // Belum ada room untuk konsultasi ini
      setSelectedRoomId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f7fb]">

      {/* SIDEBAR KIRI - DAFTAR PASIEN */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="font-bold text-[#0c72a6]">Chat Pasien</h1>
          <p className="text-xs text-gray-400 mt-1">{counselor?.name}</p>
        </div>

        {consultations.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">Belum ada konsultasi.</div>
        ) : (
          consultations.map((c) => {
            const sessionStatus = getSessionStatus(c);
            const isSelected = selectedConsultation?.id === c.id;
            return (
              <div key={c.id} onClick={() => handleSelectConsultation(c)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-pink-50 border-l-4 border-l-pink-400" : ""}`}>
                <p className="font-semibold text-sm">{c.client_name || "Pasien"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.consultation_date)} · {c.consultation_hour}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
                    sessionStatus === "ongoing" ? "bg-green-100 text-green-600" :
                    sessionStatus === "upcoming" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {sessionStatus === "ongoing" ? "Berlangsung" : sessionStatus === "upcoming" ? "Akan Datang" : "Selesai"}
                  </span>
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-purple-100 text-purple-600 font-medium capitalize">
                    {c.consultation_type}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AREA CHAT */}
      <div className="flex-1 flex flex-col">
        {!selectedConsultation ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Pilih pasien untuk mulai chat
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 bg-white border-b shadow-sm">
              <p className="font-semibold">{selectedConsultation.client_name || "Pasien"}</p>
              <p className="text-xs text-gray-400">
                {formatDate(selectedConsultation.consultation_date)} · {selectedConsultation.consultation_hour} · {selectedConsultation.consultation_type}
              </p>
              {selectedConsultation.topic && (
                <p className="text-xs text-gray-500 mt-1">Topik: {selectedConsultation.topic}</p>
              )}
            </div>

            {selectedRoomId ? (
              <ChatArea
                roomId={selectedRoomId}
                currentUserId={counselor?.authId}
                patientName={selectedConsultation.client_name}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Room chat belum tersedia untuk sesi ini.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}