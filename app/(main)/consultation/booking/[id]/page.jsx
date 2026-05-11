"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import BackIconButton from "@/components/BackIconButton";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "online";

  const [selectedHour, setSelectedHour] = useState(null);
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");

  const counselors = [
    {
      id: "1",
      name: "Dr. Diandra Aliyya Khoirunnisa, M.Psi",
      location: "Surabaya, Indonesia",
      str: "12.01.3.2.4567890",
      sipp: "503/SIP/437.72/2026",
      languages: "Indonesia, Inggris, Mandarin",
    },
  ];

  const selected = counselors.find((c) => c.id === params.id);

  const hours = [
    "08.00", "09.00", "10.00", "11.00", "12.00",
    "13.00", "14.00", "15.00", "16.00", "17.00",
  ];

  const handleBooking = () => {
    if (!date || !selectedHour) {
      alert("Please select date and time first!");
      return;
    }

    const bookingData = {
      counselorId: params.id,
      counselorName: selected?.name,
      location: selected?.location,
      type: type,
      date: date,
      hour: selectedHour,
      topic: topic,
      price: type === "offline" ? 75000 : 50000,
    };

    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

    router.push(`/consultation/payment/${params.id}?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] p-10">
      <div className="mb-5">
      <BackIconButton to={`/consultation/list?type=${type}`} />
      </div>
      <div className="flex gap-10">

        {/* ================= LEFT ================= */}
        <div className="bg-white p-6 rounded-2xl w-1/2 shadow">
          <h2 className="text-xl font-bold text-[#0C72A6] mb-6 text-center">
            Counselor Information
          </h2>

          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden">
              <Image
                src="/images/icon_profile.png"
                alt="profile"
                width={112}
                height={112}
                className="object-cover"
              />
            </div>

            <h3 className="font-bold text-center">
              {selected?.name}
            </h3>

            <p className="text-sm text-gray-500">
              📍 {selected?.location}
            </p>

            <span className="bg-pink-200 text-pink-600 px-3 py-1 rounded-full text-sm">
              Psikolog Klinis
            </span>
          </div>

          <div className="mt-6 text-sm space-y-4">
            <div>
              <p className="font-semibold">No. STR</p>
              <p className="text-gray-600">{selected?.str}</p>
              <hr className="mt-2" />
            </div>

            <div>
              <p className="font-semibold">No. SIPP</p>
              <p className="text-gray-600">{selected?.sipp}</p>
              <hr className="mt-2" />
            </div>

            <div>
              <p className="font-semibold">Bahasa</p>
              <p className="text-gray-600">{selected?.languages}</p>
              <hr className="mt-2" />
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="bg-pink-200 p-6 rounded-2xl w-1/2 shadow">
          <h2 className="text-xl font-bold text-pink-600 mb-6 text-center">
            Booking Form
          </h2>

          <div className="flex flex-col gap-5">

            <div>
              <label className="font-medium">Consul Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-lg mt-2 bg-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="font-medium">
                Consultation Hour
              </label>

              <div className="grid grid-cols-5 gap-2 mt-2">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`p-2 rounded-lg text-sm ${
                      selectedHour === hour
                        ? "bg-[#0C72A6] text-white"
                        : "bg-white"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-medium">
                What would you like to talk about?
              </label>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Write your consultation topics here"
                className="w-full p-3 rounded-lg mt-2 bg-pink-100 outline-none"
              />
            </div>

            <div className="bg-white/70 p-4 rounded-xl text-sm">
              <div className="flex justify-between">
                <span>Consultation Type</span>
                <span className="font-semibold capitalize">{type}</span>
              </div>

              <div className="flex justify-between mt-2">
                <span>Price</span>
                <span className="font-semibold">
                  Rp{type === "offline" ? "75.000" : "50.000"}
                </span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              className="bg-[#0C72A6] text-white py-3 rounded-full mt-2"
            >
              Continue to Payment
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}