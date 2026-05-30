"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";

const quickReplies = [
  "Saya butuh bantuan",
  "Saya sedang cemas",
  "Boleh konsultasi?",
];

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeHour(hour) {
  return hour?.replace(".", ":") || "00:00";
}

function getCounselorName(booking) {
  return (
    booking?.counselorName ||
    booking?.name ||
    booking?.doctorName ||
    "Counselor"
  );
}

function getSessionStatus(booking, nowMs = Date.now()) {
  if (!booking) return "not-found";

  const formattedHour = normalizeHour(booking.hour);
  const start = new Date(`${booking.date}T${formattedHour}:00`).getTime();

  if (Number.isNaN(start)) return "invalid";

  const duration = booking.sessionDuration || 60;
  const end = start + duration * 60 * 1000;

  if (nowMs < start) return "upcoming";
  if (nowMs >= start && nowMs <= end) return "ongoing";

  return "finished";
}

function getStatusLabel(status) {
  if (status === "upcoming") return "Not Started";
  if (status === "ongoing") return "Available";
  if (status === "finished") return "Expired";
  return "Unavailable";
}

function isPaymentVerified(booking) {
  return (
    booking?.paymentStatus === "Paid" ||
    (booking?.paymentStatus === "Pending Verification" &&
      booking?.adminApproved &&
      booking?.counselorApproved)
  );
}

function getStatusColor(status) {
  if (status === "ongoing") return "text-green-500";
  if (status === "upcoming") return "text-blue-500";
  return "text-gray-400";
}

function formatCountdown(booking, nowMs = Date.now()) {
  if (!booking) return "";

  const formattedHour = normalizeHour(booking.hour);
  const start = new Date(`${booking.date}T${formattedHour}:00`).getTime();
  const duration = booking.sessionDuration || 60;
  const end = start + duration * 60 * 1000;

  const status = getSessionStatus(booking, nowMs);

  let diff = 0;
  let prefix = "";

  if (status === "upcoming") {
    diff = start - nowMs;
    prefix = "Starts in";
  } else if (status === "ongoing") {
    diff = end - nowMs;
    prefix = "Ends in";
  } else if (status === "finished") {
    return "Expired";
  } else {
    return "";
  }

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `${prefix} ${String(h).padStart(2, "0")}j ${String(m).padStart(
    2,
    "0"
  )}m ${String(s).padStart(2, "0")}s`;
}

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mergeBookings(myBookings, latestTicket) {
  const merged = [...myBookings];

  if (latestTicket?.bookingCode) {
    const alreadyExist = merged.some(
      (booking) => booking.bookingCode === latestTicket.bookingCode
    );

    if (!alreadyExist) {
      merged.push(latestTicket);
    }
  }

  return merged;
}

function sortBookings(bookings, nowMs) {
  return [...bookings].sort((a, b) => {
    const order = {
      ongoing: 1,
      upcoming: 2,
      finished: 3,
      invalid: 4,
      "not-found": 5,
    };

    const statusA = getSessionStatus(a, nowMs);
    const statusB = getSessionStatus(b, nowMs);

    const orderA = order[statusA] || 99;
    const orderB = order[statusB] || 99;

    if (orderA !== orderB) return orderA - orderB;

    const timeA = new Date(`${a.date}T${normalizeHour(a.hour)}:00`).getTime();
    const timeB = new Date(`${b.date}T${normalizeHour(b.hour)}:00`).getTime();

    return timeA - timeB;
  });
}

const Bubble = ({ msg }) => {
  const isUser = msg.type === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[60%] ${isUser ? "bg-pink-200" : "bg-white"
          }`}
      >
        {msg.image && (
          <img
            src={msg.image}
            alt="uploaded"
            className="rounded-lg mb-2 w-40"
          />
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingCodeFromUrl = searchParams.get("bookingCode");

  const [bookings, setBookings] = useState([]);
  const [selectedBookingCode, setSelectedBookingCode] = useState("");
  const [messagesByBooking, setMessagesByBooking] = useState({});

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [image, setImage] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedBookings = safeJsonParse(
      localStorage.getItem("myBookings"),
      []
    );

    const latestTicket = safeJsonParse(
      localStorage.getItem("latestTicket"),
      null
    );

    const mergedBookings = mergeBookings(savedBookings, latestTicket);

    const onlineBookings = mergedBookings.filter(
      (booking) => booking.type === "online"
    );

    const normalizedBookings = onlineBookings.map((booking) => ({
      ...booking,
      counselorName: getCounselorName(booking),
    }));

    setBookings(normalizedBookings);

    const savedMessages = safeJsonParse(
      localStorage.getItem("messagesByBooking"),
      {}
    );

    setMessagesByBooking(savedMessages);

    if (bookingCodeFromUrl) {
      const selectedFromUrl = normalizedBookings.find(
        (booking) => booking.bookingCode === bookingCodeFromUrl
      );

      if (selectedFromUrl) {
        setSelectedBookingCode(selectedFromUrl.bookingCode);
        return;
      }

      setSelectedBookingCode("__NOT_FOUND__");
      return;
    }

    const ongoingBooking = normalizedBookings.find(
      (booking) => getSessionStatus(booking) === "ongoing"
    );

    if (ongoingBooking) {
      setSelectedBookingCode(ongoingBooking.bookingCode);
      return;
    }

    if (normalizedBookings.length > 0) {
      setSelectedBookingCode(normalizedBookings[0].bookingCode);
    }
  }, [bookingCodeFromUrl]);

  const sortedBookings = sortBookings(bookings, nowMs);

  const selectedBooking = sortedBookings.find(
    (booking) => booking.bookingCode === selectedBookingCode
  );

  const selectedStatus = getSessionStatus(selectedBooking, nowMs);
  const selectedVerified = isPaymentVerified(selectedBooking);
  const canChat = selectedStatus === "ongoing" && selectedVerified;

  const filteredBookings = sortedBookings.filter((booking) =>
    getCounselorName(booking)
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    if (!selectedBooking) return;

    const code = selectedBooking.bookingCode;

    setMessagesByBooking((prev) => {
      if (prev[code]) return prev;

      const updatedMessages = {
        ...prev,
        [code]: [
          {
            id: 1,
            type: "psikiater",
            text: `Halo, saya ${getCounselorName(
              selectedBooking
            )}. Ada yang bisa saya bantu saat sesi konsultasi berlangsung?`,
            time: formatTime(),
          },
        ],
      };

      localStorage.setItem(
        "messagesByBooking",
        JSON.stringify(updatedMessages)
      );

      return updatedMessages;
    });
  }, [selectedBooking]);

  const handleSelectBooking = (booking) => {
    setSelectedBookingCode(booking.bookingCode);
    router.push(`/consultation/chat?bookingCode=${booking.bookingCode}`);
  };

  const handleSend = () => {
    if (!inputValue.trim() && !image) return;

    if (!canChat) {
      alert("Chat hanya bisa digunakan selama sesi konsultasi berlangsung.");
      return;
    }

    const newMsg = {
      id: Date.now(),
      type: "user",
      text: inputValue,
      image,
      time: formatTime(),
    };

    const code = selectedBooking.bookingCode;

    setMessagesByBooking((prev) => {
      const updatedMessages = {
        ...prev,
        [code]: [...(prev[code] || []), newMsg],
      };

      localStorage.setItem(
        "messagesByBooking",
        JSON.stringify(updatedMessages)
      );

      return updatedMessages;
    });

    setInputValue("");
    setImage(null);
  };

  const handleQuickReply = (text) => {
    if (!canChat) return;
    setInputValue(text);
  };

  const handleUpload = (e) => {
    if (!canChat) {
      alert("Upload file hanya bisa dilakukan selama sesi konsultasi berlangsung.");
      return;
    }

    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const messages =
    selectedBooking && messagesByBooking[selectedBooking.bookingCode]
      ? messagesByBooking[selectedBooking.bookingCode]
      : [];

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-[#d4eefc] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center w-[420px]">
          <h1 className="text-xl font-bold text-pink-600">
            Belum Ada Room Chat
          </h1>

          <p className="text-sm text-gray-500 mt-3">
            Room chat akan muncul setelah kamu melakukan booking konsultasi
            online dan menyelesaikan pembayaran.
          </p>

          <button
            onClick={() => router.push("/consultation/my-bookings")}
            className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (selectedBookingCode === "__NOT_FOUND__") {
    return (
      <div className="min-h-screen bg-[#d4eefc] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center w-[420px]">
          <h1 className="text-xl font-bold text-pink-600">
            Booking Tidak Ditemukan
          </h1>

          <p className="text-sm text-gray-500 mt-3">
            Room chat ini tidak ditemukan. Silakan buka chat dari halaman My
            Bookings atau tiket konsultasi kamu.
          </p>

          <button
            onClick={() => router.push("/consultation/my-bookings")}
            className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#d4eefc]">
      {/* LEFT */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <BackIconButton
            to="/consultation/my-bookings"
            className="h-9 w-9 bg-pink-100 text-pink-600 shadow-none"
          />

          <h1 className="text-xl font-bold text-pink-600">
            Message
          </h1>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg bg-pink-100 outline-none"
        />

        {filteredBookings.map((booking) => {
          const status = getSessionStatus(booking, nowMs);

          return (
            <div
              key={booking.bookingCode}
              onClick={() => handleSelectBooking(booking)}
              className={`p-3 mb-2 rounded-lg cursor-pointer ${selectedBooking?.bookingCode === booking.bookingCode
                  ? "bg-pink-200"
                  : "hover:bg-pink-100"
                }`}
            >
              <p className="font-semibold">
                {getCounselorName(booking)}
              </p>

              <p className={`text-sm ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {booking.date} • {booking.hour} WIB
              </p>
            </div>
          );
        })}
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="p-4 bg-white shadow flex justify-between">
          <div>
            <p className="font-semibold">
              {getCounselorName(selectedBooking)}
            </p>

            <p className={`text-sm ${getStatusColor(selectedStatus)}`}>
              {getStatusLabel(selectedStatus)}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Booking Code: {selectedBooking?.bookingCode}
            </p>
          </div>

          <div className="text-sm text-pink-500 font-semibold text-right">
            <p>{formatCountdown(selectedBooking, nowMs)}</p>

            <p className="text-xs text-gray-400 mt-1">
              {selectedBooking?.date} • {selectedBooking?.hour} WIB
            </p>
          </div>
        </div>

        {/* STATUS WARNING */}
        {!canChat && (
          <div className="bg-yellow-100 text-yellow-700 text-sm px-4 py-3">
            {selectedStatus === "upcoming"
              ? "Room chat belum dibuka. Chat baru bisa digunakan sesuai jadwal konsultasi."
              : selectedStatus === "ongoing" && !selectedVerified
              ? "Bukti transfer sedang menunggu verifikasi. Chat akan tersedia setelah admin/konselor menyetujui."
              : "Sesi konsultasi sudah selesai. Room chat sudah tidak bisa digunakan."}
          </div>
        )}

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}
        </div>

        {/* QUICK REPLY */}
        <div className="flex gap-2 px-4 pb-2">
          {quickReplies.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickReply(q)}
              disabled={!canChat}
              className={`px-3 py-1 rounded-full text-sm ${canChat
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white flex gap-2 items-center">
          <label
            className={`w-8 h-8 flex items-center justify-center rounded-full ${canChat
                ? "bg-pink-500 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            +
            <input
              type="file"
              onChange={handleUpload}
              hidden
              disabled={!canChat}
            />
          </label>

          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              canChat
                ? "Type message..."
                : selectedStatus === "upcoming"
                  ? "Room chat belum dibuka"
                  : "Session expired"
            }
            disabled={!canChat}
            className={`flex-1 p-2 rounded-lg outline-none ${canChat
                ? "bg-pink-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          />

          <button
            onClick={handleSend}
            disabled={!canChat}
            className={`px-4 py-2 rounded-lg ${canChat
                ? "bg-pink-500 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}