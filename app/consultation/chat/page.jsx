"use client";

import { useState } from "react";

const doctors = [
  { id: 1, name: "Dr. Diandra Aliyya Khoirunisa, M.psi", status: "Available" },
  { id: 2, name: "Dr. Jessica Atalya Kriswianto, M.psi", status: "Expired" },
  { id: 3, name: "Dr. Leon Kennedy, M.psi", status: "Expired" },
  { id: 4, name: "Dr. Maudy Ayunda, M.psi", status: "Expired" },
  { id: 5, name: "Dr. Ethan Winters, M.psi", status: "Expired" },
];

const initialMessages = [
  { id: 1, type: "psikiater", text: "Message from psikiater" },
  { id: 2, type: "user", text: "Message from user" },
];

const Bubble = ({ text, isUser }) => (
  <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`px-4 py-2 rounded-2xl max-w-[60%] ${
        isUser ? "bg-pink-200" : "bg-white"
      }`}
    >
      {text}
    </div>
  </div>
);

export default function Message() {
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, type: "user", text: inputValue },
    ]);

    setInputValue("");
  };

  return (
    <div className="flex h-screen bg-[#d4eefc]">
      {/* LEFT */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 text-pink-600">Message</h1>

        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg bg-pink-100 outline-none"
        />

        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-pink-100"
          >
            <p className="font-semibold">{doc.name}</p>
            <p className="text-sm text-gray-500">{doc.status}</p>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="p-4 bg-white shadow">
          <p className="font-semibold">{selectedDoctor.name}</p>
          <p className="text-sm text-gray-500">Last active recently</p>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <Bubble
              key={msg.id}
              text={msg.text}
              isUser={msg.type === "user"}
            />
          ))}
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type message..."
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