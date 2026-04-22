"use client";

import { useState, useEffect } from "react";

const patients = [
  { id: 1, name: "Maysho Anindita Putri Ramadhani", status: "Active", age: 20, issue: "Anxiety" },
  { id: 2, name: "Alya Zahra Maharani Kusuma", status: "Expired", age: 21, issue: "Overthinking" },
  { id: 3, name: "Raka Pratama Wijaya Kusuma", status: "Active", age: 22, issue: "Stress Akademik" },
  { id: 4, name: "Dimas Arya Nugraha Saputra", status: "Active", age: 23, issue: "Burnout" },
];

const quickReplies = [
  "Terima kasih sudah berbagi 🙏",
  "Bisa diceritakan lebih lanjut?",
  "Mari kita tarik napas perlahan",
];

const Bubble = ({ msg }) => {
  const isCounselor = msg.type === "psikiater";

  return (
    <div className={`flex mb-3 ${isCounselor ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-2 rounded-2xl max-w-[60%] ${isCounselor ? "bg-pink-300" : "bg-white"}`}>
        <p className="break-words">{msg.text}</p>
        <div className="text-[10px] text-gray-500 text-right mt-1">{msg.time}</div>
      </div>
    </div>
  );
};

export default function CounselorChat() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const [messagesByPatient, setMessagesByPatient] = useState({});
  const [notesByPatient, setNotesByPatient] = useState({});
  const [followUps, setFollowUps] = useState({});

  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  // MODAL
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const formatTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // INIT CHAT
  useEffect(() => {
    if (!selectedPatient) return;

    setShowInfo(false);

    if (!messagesByPatient[selectedPatient.id]) {
      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatient.id]: [
          {
            id: 1,
            type: "user",
            text: "Halo dok, saya butuh bantuan",
            time: formatTime(),
          },
        ],
      }));
    }
  }, [selectedPatient]);

  const handleSend = () => {
    if (!inputValue.trim() || selectedPatient.status === "Expired") return;

    const newMsg = {
      id: Date.now(),
      type: "psikiater",
      text: inputValue,
      time: formatTime(),
    };

    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMsg],
    }));

    setInputValue("");
  };

  const handleQuickReply = (text) => setInputValue(text);

  const handleSaveFollowUp = () => {
    if (!date || !time) return;

    setFollowUps((prev) => ({
      ...prev,
      [selectedPatient.id]: `${date} ${time}`,
    }));

    setShowModal(false);
    setDate("");
    setTime("");
  };

  const messages = selectedPatient
    ? messagesByPatient[selectedPatient.id] || []
    : [];

  return (
    <div className="flex h-screen bg-[#f5f7fb]">

      {/* LEFT */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        <h1 className="font-bold mb-4">Patients</h1>

        {patients.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPatient(p)}
            className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">{p.name}</p>
            <p className={`text-sm ${p.status === "Active" ? "text-green-500" : "text-gray-400"}`}>
              {p.status}
            </p>
          </div>
        ))}
      </div>

      {/* CENTER */}
      <div className="flex-1 flex flex-col">

        {!selectedPatient ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Pilih pasien dulu
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 bg-white flex justify-between shadow">
              <div
                onClick={() => setShowInfo((prev) => !prev)}
                className="cursor-pointer"
              >
                <p className="font-semibold">{selectedPatient.name}</p>
                <p className="text-sm text-gray-500">{selectedPatient.status}</p>
              </div>
            </div>

            {/* CHAT */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}
            </div>

            {/* QUICK REPLY */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
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
            <div className="p-4 bg-white flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={selectedPatient.status === "Expired"}
                className="flex-1 p-2 rounded-lg bg-gray-100"
              />
              <button onClick={handleSend} className="bg-pink-500 text-white px-4 rounded-lg">
                Send
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      {showInfo && selectedPatient && (
        <div className="w-1/4 bg-white p-4 border-l">
          <h2 className="font-bold mb-4">Patient Info</h2>

          <p><b>Nama:</b> {selectedPatient.name}</p>
          <p><b>Umur:</b> {selectedPatient.age}</p>
          <p><b>Keluhan:</b> {selectedPatient.issue}</p>

          {/* NOTES */}
          <h3 className="mt-4 font-bold">Notes</h3>
          <textarea
            value={notesByPatient[selectedPatient.id] || ""}
            onChange={(e) =>
              setNotesByPatient((prev) => ({
                ...prev,
                [selectedPatient.id]: e.target.value,
              }))
            }
            className="w-full h-24 p-2 bg-gray-100 rounded"
          />

          {/* FOLLOW UP */}
          <h3 className="mt-4 font-bold">Follow-up</h3>
          <p className="text-sm text-gray-500">
            {followUps[selectedPatient.id] || "Belum ada jadwal"}
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-2 w-full bg-pink-500 text-white py-2 rounded"
          >
            Schedule Follow-up
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="font-bold mb-4">Schedule Follow-up</h2>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={handleSaveFollowUp}
                className="bg-pink-500 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}