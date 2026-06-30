"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Pecah range start_time-end_time jadi slot per jam, mis. "08:00"-"12:00" -> ["08.00","09.00","10.00","11.00"]
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
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);

  useEffect(() => {
    const fetchCounselor = async () => {
      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .eq("id", params.id)
        .single();
      if (!error) setCounselor(data);
      setLoading(false);
    };
    fetchCounselor();
  }, [params.id]);

  useEffect(() => {
    if (!counselor) return;
    const fetchAllSchedules = async () => {
      const { data, error } = await supabase
        .from("counselor_schedules")
        .select("*")
        .eq("counselor_id", counselor.id);
      if (!error && data) {
        setAllSchedules(data);
        console.log("✅ Jadwal dari database:", data);
      } else {
        console.error("❌ Gagal ambil jadwal:", error);
      }
    };
    fetchAllSchedules();
  }, [counselor]);

  const [availableHours, setAvailableHours] = useState([]);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState("");

  // AMBIL DATA KONSELOR ASLI
  useEffect(() => {
    const fetchCounselor = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching counselor:", error);
        setErrorMessage("Konselor tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      setSelected(data);
      setIsLoading(false);
    };

    if (params.id) fetchCounselor();
  }, [params.id]);

  // SETIAP TANGGAL BERUBAH, AMBIL JAM YANG TERSEDIA DARI counselor_schedules
  // LALU BUANG JAM YANG SUDAH DIBOOKING ORANG LAIN DI consultations
  useEffect(() => {
    const fetchAvailableHours = async () => {
      if (!date || !selected) {
        setAvailableHours([]);
        return;
      }

      setIsLoadingHours(true);
      setHoursMessage("");
      setSelectedHour(null);

      // Cari hari dalam minggu dari tanggal yang dipilih
      const dayName = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];

      // 1. Ambil jadwal konselor di hari itu, sesuai mode (online/offline)
      const { data: schedules, error: scheduleError } = await supabase
        .from("counselor_schedules")
        .select("*")
        .eq("counselor_id", selected.id)
        .eq("day", dayName)
        .eq("mode", type)
        .eq("status", "available");

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
        setHoursMessage("Gagal memuat jadwal konselor.");
        setAvailableHours([]);
        setIsLoadingHours(false);
        return;
      }

      if (!schedules || schedules.length === 0) {
        setHoursMessage(
          `Konselor tidak memiliki jadwal ${type} pada hari ${dayName}.`
        );
        setAvailableHours([]);
        setIsLoadingHours(false);
        return;
      }

      // Pecah semua range jadi slot per jam
      let allSlots = [];
      schedules.forEach((s) => {
        allSlots = allSlots.concat(
          splitIntoHourlySlots(s.start_time, s.end_time)
        );
      });

      // 2. Cek slot yang sudah dibooking di tanggal itu (selain yang dibatalkan)
      const { data: bookedConsultations, error: bookedError } = await supabase
        .from("consultations")
        .select("consultation_hour, status")
        .eq("counselor_id", selected.id)
        .eq("consultation_date", date)
        .neq("status", "cancelled");

      if (bookedError) {
        console.error("Error fetching booked hours:", bookedError);
      }

      const bookedHours = (bookedConsultations || []).map((b) =>
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
      alert("Pilih tanggal dan jam terlebih dahulu!");
      return;
    }
    if (!availableSlots.includes(selectedHour)) {
      alert("Jam yang dipilih tidak tersedia.");
      return;
    }
    const price = type === "online" ? counselor.online_price : counselor.offline_price;
    const bookingData = {
      counselorId: selected.id,
      counselorName: selected.name,
      location: selected.address || selected.location || "-",
      type: type,
      date: date,
      hour: selectedHour,
      topic,
      price,
    };
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    router.push(`/consultation/payment/${counselor.id}?type=${type}`);
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
        <div className="bg-white p-6 rounded-2xl w-1/2 shadow">
          <h2 className="text-xl font-bold text-[#0C72A6] mb-6 text-center">Counselor Information</h2>
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

            <h3 className="font-bold text-center">
              {selected?.name}
            </h3>

            <p className="text-sm text-gray-500">
              📍 {selected?.address || selected?.location || "-"}
            </p>

            <span className="bg-pink-200 text-pink-600 px-3 py-1 rounded-full text-sm">
              {selected?.specialty || selected?.specialization || "Psikolog"}
            </span>
          </div>
          <div className="mt-6 text-sm space-y-4">
            <div>
              <p className="font-semibold">No. STR</p>
              <p className="text-gray-600">{selected?.str || "-"}</p>
              <hr className="mt-2" />
            </div>

            <div>
              <p className="font-semibold">No. SIPP</p>
              <p className="text-gray-600">{selected?.sipp || "-"}</p>
              <hr className="mt-2" />
            </div>

            <div>
              <p className="font-semibold">Bahasa</p>
              <p className="text-gray-600">{selected?.languages || "-"}</p>
              <hr className="mt-2" />
            </div>
          </div>
        </div>

        <div className="bg-pink-200 p-6 rounded-2xl w-1/2 shadow">
          <h2 className="text-xl font-bold text-pink-600 mb-6 text-center">Booking Form</h2>
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
              <label className="font-medium">
                Consultation Hour
              </label>

              {!date && (
                <p className="text-sm text-gray-500 mt-2">
                  Pilih tanggal terlebih dahulu untuk melihat jam yang tersedia.
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
                placeholder="Tulis topik konsultasi"
                className="w-full p-3 rounded-lg mt-2 bg-pink-100 outline-none"
              />
            </div>
            <div className="bg-white/70 p-4 rounded-xl text-sm">
              <div className="flex justify-between"><span>Consultation Type</span><span className="font-semibold capitalize">{type}</span></div>
              <div className="flex justify-between mt-2"><span>Price</span><span className="font-semibold">Rp {price?.toLocaleString()}</span></div>
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