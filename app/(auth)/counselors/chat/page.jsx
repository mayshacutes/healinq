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

function formatDateLabel(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function getSessionStatus(consultation) {
  const start = new Date(`${consultation.consultation_date}T${consultation.consultation_hour?.replace(".", ":")}:00`);
  const end = new Date(start.getTime() + (consultation.session_duration || 60) * 60000);
  const now = new Date();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "finished";
}

function ChatArea({ roomId, currentUserId, patientName }) {
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f4fd] flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#0C72A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Belum ada pesan</p>
            <p className="text-gray-300 text-xs mt-1">Mulai percakapan dengan pasien</p>
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
              const isCounselor = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-2 ${isCounselor ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {!isCounselor && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      {patientName?.charAt(0) || "P"}
                    </div>
                  )}
                  <div className={`max-w-[70%] sm:max-w-[60%] ${isCounselor ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isCounselor
                        ? "bg-gradient-to-br from-[#0C72A6] to-[#095f8c] text-white rounded-2xl rounded-br-sm shadow-sm"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100"
                    }`}>
                      <p className="break-words">{msg.message}</p>
                    </div>
                    <span className={`text-[10px] mt-1 ${isCounselor ? "text-right text-blue-300" : "text-left text-gray-400"}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  {isCounselor && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0C72A6] to-[#095f8c] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      K
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 sm:px-6 pb-2 flex gap-2 flex-wrap">
        {quickReplies.map((q, i) => (
          <button key={i} onClick={() => setInput(q)}
            className="bg-white border border-[#0C72A6]/20 px-4 py-1.5 rounded-full text-xs text-[#0C72A6] hover:bg-[#e8f4fd] hover:border-[#0C72A6]/40 transition font-medium shadow-sm">
            {q}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-3 items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200 focus-within:border-[#0C72A6] focus-within:shadow-sm transition">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tulis pesan..."
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder-gray-400" />
          <button onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-[#0C72A6] to-[#095f8c] text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default function CounselorChatPage() {
  const [counselor, setCounselor] = useState(null);
  const [counselorRealAuthId, setCounselorRealAuthId] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const storedId = sessionStorage.getItem("counselorId");
      let counselorData = null;

      if (storedId) {
        const { data } = await supabase
          .from("counselors")
          .select("id, name, email, auth_email")
          .eq("id", storedId)
          .maybeSingle();
        if (data && (data.email === user.email || data.auth_email === user.email)) {
          counselorData = data;
        }
      }

      if (!counselorData) {
        const { data } = await supabase
          .from("counselors")
          .select("id, name, email, auth_email")
          .or(`email.eq.${user.email},auth_email.eq.${user.email}`)
          .maybeSingle();
        counselorData = data;
        if (counselorData) {
          sessionStorage.setItem("counselorId", counselorData.id);
        }
      }

      if (!counselorData) { setIsLoading(false); return; }
      setCounselor(counselorData);

      const targetEmail = counselorData.auth_email || counselorData.email;
      const res = await fetch(`/api/get-auth-id?email=${encodeURIComponent(targetEmail)}`);
      const { id: realAuthId } = await res.json();
      setCounselorRealAuthId(realAuthId || user.id);

      const data = await getCounselorConsultations(counselorData.id);
      setConsultations(data || []);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectConsultation = async (consultation) => {
    const status = getSessionStatus(consultation);
    if (status !== "ongoing") {
      alert("Room chat hanya bisa dibuka selama sesi konsultasi berlangsung.");
      return;
    }

    setSelectedConsultation(consultation);
    setSelectedRoomId(null);

    const { data: roomData } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("consultation_id", consultation.id)
      .maybeSingle();

    if (roomData?.id) {
      setSelectedRoomId(roomData.id);
    }
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#d4effc] to-[#e8f4fd]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
          <p className="text-sm text-[#0C72A6] font-medium">Memuat chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#d4effc] to-[#e8f4fd]">

      {/* SIDEBAR - DAFTAR PASIEN */}
      <div className={`${
        showMobileList ? "flex" : "hidden"
      } md:flex w-full md:w-[340px] lg:w-[380px] bg-white/95 backdrop-blur-sm border-r border-gray-200 overflow-y-auto flex-col`}>
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#e8f4fd] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0C72A6] to-[#095f8c] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {counselor?.name?.charAt(0) || "K"}
            </div>
            <div>
              <h1 className="font-bold text-[#0C72A6] text-sm">Chat Pasien</h1>
              <p className="text-xs text-gray-400">{counselor?.name}</p>
            </div>
          </div>
        </div>

        {consultations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f4fd] flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#0C72A6]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Belum ada konsultasi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {consultations.map((c) => {
              const sessionStatus = getSessionStatus(c);
              const isSelected = selectedConsultation?.id === c.id;
              const isOngoing = sessionStatus === "ongoing";
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConsultation(c)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected
                      ? "bg-[#e8f4fd] border-l-4 border-l-[#0C72A6]"
                      : "border-l-4 border-l-transparent hover:bg-gray-50"
                  } ${!isOngoing ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm ${
                      isOngoing
                        ? "bg-gradient-to-br from-green-400 to-green-500"
                        : "bg-gradient-to-br from-gray-300 to-gray-400"
                    }`}>
                      {c.client_name?.charAt(0) || "P"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-800 truncate">{c.client_name || "Pasien"}</p>
                        {isOngoing && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0"></span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{formatDate(c.consultation_date)} · {c.consultation_hour}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AREA CHAT */}
      <div className={`${
        showMobileList ? "hidden" : "flex"
      } md:flex flex-1 flex-col`}>
        {!selectedConsultation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-20 h-20 rounded-full bg-[#e8f4fd] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#0C72A6]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Pilih pasien untuk mulai chat</p>
              <p className="text-xs text-gray-300 mt-1">Pilih dari daftar pasien di samping</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center gap-3 shadow-sm">
              <button onClick={handleBackToList}
                className="md:hidden w-9 h-9 rounded-full bg-[#e8f4fd] flex items-center justify-center text-[#0C72A6] hover:bg-[#d4effc] transition shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {selectedConsultation.client_name?.charAt(0) || "P"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {selectedConsultation.client_name || "Pasien"}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {formatDate(selectedConsultation.consultation_date)} · {selectedConsultation.consultation_hour} · {selectedConsultation.consultation_type}
                </p>
                {selectedConsultation.topic && (
                  <p className="text-[11px] text-[#0C72A6] font-medium truncate mt-0.5">
                    Topik: {selectedConsultation.topic}
                  </p>
                )}
              </div>
            </div>

            {selectedRoomId && counselorRealAuthId ? (
              <ChatArea
                roomId={selectedRoomId}
                currentUserId={counselorRealAuthId}
                patientName={selectedConsultation.client_name}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Room chat belum tersedia</p>
                <p className="text-xs text-gray-300">Sesi ini belum memiliki room chat</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
