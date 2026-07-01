"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

function splitIntoHourlySlots(startTime, endTime) {
  const slots = [];
  let [h] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);
  while (h < endH) {
    slots.push(`${String(h).padStart(2, "0")}.00`);
    h += 1;
  }
  return slots;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "online";

  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedHour, setSelectedHour] = useState(null);
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");

  const [availableHours, setAvailableHours] = useState([]);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState("");

  // AMBIL DATA KONSELOR ASLI
  useEffect(() => {
    const fetchCounselor = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        setErrorMessage("Konselor tidak ditemukan.");
        setIsLoading(false);
        return;
      }
      setSelected(data);
      setIsLoading(false);
    };
    if (params.id) fetchCounselor();
  }, [params.id]);

  // AMBIL JAM TERSEDIA DARI counselor_schedules BERDASARKAN TANGGAL + EMAIL
  useEffect(() => {
    const fetchAvailableHours = async () => {
      if (!date || !selected) {
        setAvailableHours([]);
        return;
      }

      setIsLoadingHours(true);
      setHoursMessage("");
      setSelectedHour(null);

      // Query pakai counselor_email dan schedule_date (bukan day)
      const { data: schedules, error: scheduleError } = await supabase
        .from("counselor_schedules")
        .select("*")
        .eq("counselor_email", selected.email)
        .eq("schedule_date", date)
        .eq("mode", type)
        .eq("status", "available");

      console.log("Schedules:", schedules, scheduleError);

      if (scheduleError) {
        setHoursMessage("Gagal memuat jadwal konselor.");
        setAvailableHours([]);
        setIsLoadingHours(false);
        return;
      }

      if (!schedules || schedules.length === 0) {
        setHoursMessage(`Konselor tidak memiliki jadwal ${type} pada tanggal ini.`);
        setAvailableHours([]);
        setIsLoadingHours(false);
        return;
      }

      // Pecah range jadi slot per jam
      let allSlots = [];
      schedules.forEach((s) => {
        allSlots = allSlots.concat(splitIntoHourlySlots(s.start_time, s.end_time));
      });

      // Buang slot yang sudah dibooking
      const { data: booked } = await supabase
        .from("consultations")
        .select("consultation_hour, status")
        .eq("counselor_id", selected.id)
        .eq("consultation_date", date)
        .neq("status", "cancelled");

      const bookedHours = (booked || []).map((b) =>
        b.consultation_hour?.replace(":", ".")
      );

      const freeSlots = allSlots.filter((slot) => !bookedHours.includes(slot));
      setAvailableHours(freeSlots);

      if (freeSlots.length === 0) {
        setHoursMessage("Semua jam pada tanggal ini sudah penuh.");
      }
      setIsLoadingHours(false);
    };

    fetchAvailableHours();
  }, [date, selected, type]);

  const handleBooking = () => {
    if (!date || !selectedHour) {
      alert("Please select date and time first!");
      return;
    }

    const bookingData = {
      counselorId: selected.id,
      counselorName: selected.name,
      location: selected.address || selected.location || "-",
      type: type,
      date: date,
      hour: selectedHour,
      topic: topic,
      price: type === "offline" ? 75000 : 50000,
    };

    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    router.push(`/consultation/payment/${params.id}?type=${type}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
      </div>
    );
  }

  if (errorMessage || !selected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center w-[420px]">
          <h1 className="text-xl font-bold text-[#0C72A6]">
            {errorMessage || "Counselor not found"}
          </h1>
          <button
            onClick={() => router.push(`/consultation/list?type=${type}`)}
            className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] p-10">
      <div className="mb-5">
        <BackIconButton to={`/consultation/list?type=${type}`} />
      </div>
      <div className="flex gap-10">

        {/* LEFT - INFO KONSELOR */}
        <div className="bg-white p-6 rounded-2xl w-1/2 shadow">
          <h2 className="text-xl font-bold text-[#0C72A6] mb-6 text-center">
            Counselor Information
          </h2>
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden">
              <Image
                src={selected?.photo_url || "/images/icon_profile.png"}
                alt="profile"
                width={112}
                height={112}
                className="object-cover"
              />
            </div>
            <h3 className="font-bold text-center">{selected?.name}</h3>
            <p className="text-sm text-gray-500">
              📍 {selected?.address || selected?.location || "-"}
            </p>
            <span className="bg-pink-200 text-pink-600 px-3 py-1 rounded-full text-sm">
              {selected?.specialty || selected?.specialization || "Psikolog"}
            </span>
          </div>
          <div className="mt-6 text-sm space-y-4">
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-gray-600">{selected?.email || "-"}</p>
              <hr className="mt-2" />
            </div>
            <div>
              <p className="font-semibold">Sessions</p>
              <p className="text-gray-600">{selected?.sessions || 0} clients</p>
              <hr className="mt-2" />
            </div>
          </div>
        </div>

        {/* RIGHT - BOOKING FORM */}
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
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-lg mt-2 bg-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="font-medium">Consultation Hour</label>
              {!date && (
                <p className="text-sm text-gray-500 mt-2">
                  Pilih tanggal terlebih dahulu.
                </p>
              )}
              {date && isLoadingHours && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
                </div>
              )}
              {date && !isLoadingHours && hoursMessage && (
                <p className="text-sm text-pink-700 mt-2">{hoursMessage}</p>
              )}
              {date && !isLoadingHours && availableHours.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {availableHours.map((hour) => (
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
              )}
            </div>

            <div>
              <label className="font-medium">What would you like to talk about?</label>
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
              disabled={!date || !selectedHour}
              className="bg-[#0C72A6] text-white py-3 rounded-full mt-2 disabled:bg-gray-400"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}