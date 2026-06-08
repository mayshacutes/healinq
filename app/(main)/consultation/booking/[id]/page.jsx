"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "online";

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

  useEffect(() => {
    if (!date || allSchedules.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const computeSlots = async () => {
      // Filter jadwal berdasarkan tanggal, mode, status
      const filtered = allSchedules.filter(s => 
        s.schedule_date === date && 
        s.mode === type && 
        s.status === "available"
      );

      if (filtered.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Generate slot per jam
      let slots = [];
      filtered.forEach(schedule => {
        const startHour = parseInt(schedule.start_time.split(":")[0], 10);
        const endHour = parseInt(schedule.end_time.split(":")[0], 10);
        for (let hour = startHour; hour < endHour; hour++) {
          slots.push(`${hour.toString().padStart(2, "0")}:00`);
        }
      });
      slots = [...new Set(slots)].sort();

      // Ambil booking yang sudah ada pada tanggal ini untuk konselor ini
      const { data: existingBookings, error: bookingError } = await supabase
        .from("consultations")
        .select("consultation_hour")
        .eq("counselor_id", counselor.id)
        .eq("consultation_date", date)
        .in("status", ["pending", "confirmed", "success"]);

      if (!bookingError && existingBookings && existingBookings.length > 0) {
        const bookedHours = existingBookings.map(b => b.consultation_hour);
        slots = slots.filter(slot => !bookedHours.includes(slot));
        console.log("🚫 Booked hours:", bookedHours);
      }

      console.log("⏰ Slot tersedia setelah filter booking:", slots);
      setAvailableSlots(slots);
    };

    computeSlots();
  }, [date, type, allSchedules, counselor]);

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
      counselorId: counselor.id,
      counselorName: counselor.name,
      type,
      date,
      hour: selectedHour,
      topic,
      price,
    };
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    router.push(`/consultation/payment/${counselor.id}?type=${type}`);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!counselor) return <div className="p-10 text-center">Konselor tidak ditemukan</div>;

  const price = type === "online" ? counselor.online_price : counselor.offline_price;

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
              <Image src={counselor.image_url || "/images/icon_profile.png"} alt="profile" width={112} height={112} className="object-cover" />
            </div>
            <h3 className="font-bold text-center">{counselor.name}</h3>
            <p className="text-sm text-gray-500">📍 {counselor.location}</p>
            <span className="bg-pink-200 text-pink-600 px-3 py-1 rounded-full text-sm">{counselor.specialty}</span>
          </div>
          <div className="mt-6 text-sm space-y-4">
            <div><p className="font-semibold">No. STR</p><p className="text-gray-600">{counselor.str_number || "-"}</p><hr /></div>
            <div><p className="font-semibold">No. SIPP</p><p className="text-gray-600">{counselor.sipp_number || "-"}</p><hr /></div>
            <div><p className="font-semibold">Bahasa</p><p className="text-gray-600">{counselor.languages || "-"}</p><hr /></div>
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
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-lg mt-2 bg-pink-100 outline-none"
              />
            </div>
            <div>
              <label className="font-medium">Consultation Hour</label>
              {!date ? (
                <p className="text-sm text-gray-600 mt-2">Pilih tanggal terlebih dahulu</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-red-500 mt-2">Tidak ada jadwal untuk tanggal ini</p>
              ) : (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {availableSlots.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                      className={`p-2 rounded-lg text-sm ${
                        selectedHour === hour ? "bg-[#0C72A6] text-white" : "bg-white"
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
            <button onClick={handleBooking} className="bg-[#0C72A6] text-white py-3 rounded-full mt-2">Continue to Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
}