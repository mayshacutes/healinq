"use client";

import { useState, useEffect } from "react";

const doctors = [
  { id: 1, name: "Dr. Diandra Aliyya Khoirunisa, M.psi", status: "Available" },
  { id: 2, name: "Dr. Jessica Atalya Kriswianto, M.psi", status: "Expired" },
  { id: 3, name: "Dr. Leon Kennedy, M.psi", status: "Available" },
  { id: 4, name: "Dr. Maudy Ayunda, M.psi", status: "Expired" },
  { id: 5, name: "Dr. Ethan Winters, M.psi", status: "Available" },
  { id: 6, name: "Dr. Claire Redfield, M.psi", status: "Available" },
  { id: 7, name: "Dr. Ada Wong, M.psi", status: "Expired" },
];

const quickReplies = [
  "Saya butuh bantuan",
  "Saya sedang cemas",
  "Boleh konsultasi?",
];

// ✅ FIXED BUBBLE (NO TABRAK)
const Bubble = ({ msg }) => {
  const isUser = msg.type === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[60%] ${
          isUser ? "bg-pink-200" : "bg-white"
        }`}
      >
        {msg.image && (
          <img src={msg.image} className="rounded-lg mb-2 w-40" />
        )}

        <p className="break-words">{msg.text}</p>

        <div className="text-[10px] text-gray-500 text-right mt-1">
          {msg.time}
        </div>
      </div>
    </div>
  );
};

export default function Message() {
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
  const [messagesByDoctor, setMessagesByDoctor] = useState({});
  const [sessionStart, setSessionStart] = useState({});

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [image, setImage] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // 🔍 SEARCH
  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const formatTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🤖 AUTO MESSAGE + START SESSION
  useEffect(() => {
    if (!messagesByDoctor[selectedDoctor.id]) {
      setMessagesByDoctor((prev) => ({
        ...prev,
        [selectedDoctor.id]: [
          {
            id: 1,
            type: "psikiater",
            text: `Halo, saya ${selectedDoctor.name}. Ada yang bisa saya bantu?`,
            time: formatTime(),
          },
        ],
      }));

      setSessionStart((prev) => ({
        ...prev,
        [selectedDoctor.id]: Date.now(),
      }));
    }
  }, [selectedDoctor]);

  // ⏳ COUNTDOWN
  useEffect(() => {
    const interval = setInterval(() => {
      const start = sessionStart[selectedDoctor.id];
      if (!start) return;

      const diff = 24 * 60 * 60 * 1000 - (Date.now() - start);

      if (diff <= 0) {
        setSelectedDoctor((prev) => ({ ...prev, status: "Expired" }));
        setTimeLeft("Expired");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${h}j ${m}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDoctor, sessionStart]);

  const handleSend = () => {
    if (!inputValue.trim() && !image) return;

    if (selectedDoctor.status === "Expired") {
      window.location.href = `/booking?doctor=${selectedDoctor.name}`;
      return;
    }

    const newMsg = {
      id: Date.now(),
      type: "user",
      text: inputValue,
      image,
      time: formatTime(),
    };

    setMessagesByDoctor((prev) => ({
      ...prev,
      [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), newMsg],
    }));

    setInputValue("");
    setImage(null);
  };

  const handleQuickReply = (text) => {
    setInputValue(text);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const messages = messagesByDoctor[selectedDoctor.id] || [];

  return (
    <div className="flex h-screen bg-[#d4eefc]">
      {/* LEFT */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 text-pink-600">Message</h1>

        {/* 🔍 SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg bg-pink-100 outline-none"
        />

        {/* LIST DOKTER */}
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className={`p-3 mb-2 rounded-lg cursor-pointer ${
              selectedDoctor.id === doc.id
                ? "bg-pink-200"
                : "hover:bg-pink-100"
            }`}
          >
            <p className="font-semibold">{doc.name}</p>
            <p
              className={`text-sm ${
                doc.status === "Available"
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            >
              {doc.status}
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="p-4 bg-white shadow flex justify-between">
          <div>
            <p className="font-semibold">{selectedDoctor.name}</p>
            <p className="text-sm text-gray-500">
              {selectedDoctor.status}
            </p>
          </div>

          <div className="text-sm text-pink-500 font-semibold">
            {timeLeft}
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}
        </div>

        {/* ⚡ QUICK REPLY */}
        <div className="flex gap-2 px-4 pb-2">
          {quickReplies.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickReply(q)}
              className="bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {q}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white flex gap-2 items-center">
          {/* ➕ */}
          <label className="bg-pink-500 text-white w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
            +
            <input type="file" onChange={handleUpload} hidden />
          </label>

          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              selectedDoctor.status === "Expired"
                ? "Session expired, silakan booking ulang"
                : "Type message..."
            }
            disabled={selectedDoctor.status === "Expired"}
            className="flex-1 p-2 rounded-lg bg-pink-100 outline-none"
          />

          <button
            onClick={handleSend}
            className="bg-pink-500 text-white px-4 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}