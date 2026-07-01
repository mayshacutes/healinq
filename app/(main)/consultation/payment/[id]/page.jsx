"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";
import { createRoomForConsultation } from "@/lib/chatRooms";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") || "online";

  const [bookingData, setBookingData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofDataUrl, setProofDataUrl] = useState(null);
  const [proofMessage, setProofMessage] = useState("");
  const [consultationId, setConsultationId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("pendingBooking");
    if (saved) setBookingData(JSON.parse(saved));
  }, []);

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const adminFee = 2500;
  const price = bookingData?.price || 50000;
  const total = price + adminFee;

  // BAYAR: INSERT KE consultations + payments + chat_rooms
  const handlePayment = async () => {
    if (!bookingData) return;
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Kamu harus login terlebih dahulu.");
        setIsProcessing(false);
        return;
      }

      // Ambil nama user dari profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .maybeSingle();

      const clientName = profile?.full_name || profile?.username || user.email;
      const bookingCode = `BK-${Date.now()}`;

      // 1. INSERT KE TABEL consultations
      const { data: consultation, error: consultError } = await supabase
        .from("consultations")
        .insert({
          client_id: user.id,
          counselor_id: bookingData.counselorId,
          counselor_name: bookingData.counselorName,
          client_name: clientName,
          consultation_type: bookingData.type,
          consultation_date: bookingData.date,
          consultation_hour: bookingData.hour,
          topic: bookingData.topic || null,
          price: price,
          admin_fee: adminFee,
          counselor_earning: price - adminFee,
          status: "pending",
          booking_code: bookingCode,
          session_duration: 60,
          proof_uploaded: false,
          attendance_confirmed: false,
        })
        .select()
        .single();

      if (consultError) {
        console.error("Error insert consultation:", consultError);
        alert("Gagal membuat booking: " + consultError.message);
        setIsProcessing(false);
        return;
      }

      // 2. INSERT KE TABEL payments
      await supabase.from("payments").insert({
        consultation_id: consultation.id,
        payment_method: selectedMethod,
        payment_status: "pending",
      });

      // 3. BUAT CHAT ROOM
      await createRoomForConsultation(consultation.id, user.id, bookingData.counselorId);

      // 4. Simpan ke localStorage untuk halaman tiket
      const ticketData = {
        ...bookingData,
        bookingCode,
        consultationId: consultation.id,
        paymentMethod: selectedMethod,
        paymentStatus: "Pending Verification",
        adminFee,
        totalPayment: total,
        clientName,
        createdAt: new Date().toISOString(),
        sessionDuration: 60,
      };

      const oldBookings = JSON.parse(localStorage.getItem("myBookings") || "[]");
      localStorage.setItem("myBookings", JSON.stringify([...oldBookings, ticketData]));
      localStorage.setItem("latestTicket", JSON.stringify(ticketData));
      localStorage.removeItem("pendingBooking");

      setConsultationId(consultation.id);
      setBookingData(ticketData);
      setPaymentCompleted(true);
      setIsProcessing(false);
      setProofMessage("Pembayaran berhasil. Silakan upload bukti transfer untuk verifikasi.");

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Terjadi kesalahan. Coba lagi.");
      setIsProcessing(false);
    }
  };

  // UPLOAD BUKTI BAYAR
  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setProofDataUrl(reader.result); setProofFile(file); };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofFile || !consultationId) {
      alert("Pilih file bukti pembayaran terlebih dahulu.");
      return;
    }

    // Upload ke Supabase Storage
    const filePath = `proof/${consultationId}_${Date.now()}_${proofFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, proofFile);

    if (uploadError) {
      // Jika storage belum dibuat, tetap update DB tanpa file URL
      console.warn("Upload storage gagal:", uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);

    await supabase.from("consultations").update({
      proof_uploaded: true,
      proof_file_name: proofFile.name,
      proof_file_url: urlData?.publicUrl || null,
      proof_uploaded_at: new Date().toISOString(),
    }).eq("id", consultationId);

    setProofMessage("Bukti transfer berhasil diupload. Menunggu verifikasi admin.");
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-[#d4eefb] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center w-[420px]">
          <h1 className="text-xl font-bold text-[#0C72A6]">Booking Data Not Found</h1>
          <p className="text-sm text-gray-500 mt-3">Isi form booking terlebih dahulu.</p>
          <button onClick={() => router.push(`/consultation/booking/${params.id}?type=${typeFromUrl}`)}
            className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full">
            Back to Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <BackIconButton to={`/consultation/booking/${params.id}?type=${typeFromUrl}`} />
        </div>
        <h1 className="text-3xl font-bold text-[#0C72A6] mb-2">Payment</h1>
        <p className="text-gray-600 mb-8">Selesaikan pembayaran untuk konfirmasi booking konsultasi.</p>

        <div className="grid grid-cols-2 gap-8">
          {/* KIRI - PILIH METODE */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-xl font-bold text-pink-600 mb-5">Pilih Metode Pembayaran</h2>
            <div className="space-y-3">
              {[
                { id: "qris", label: "QRIS", desc: "Scan QR untuk membayar" },
                { id: "ewallet", label: "E-Wallet", desc: "GoPay, OVO, DANA, ShopeePay" },
                { id: "bank", label: "Bank Transfer", desc: "Transfer via virtual account" },
              ].map((m) => (
                <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                  className={`w-full p-4 rounded-xl border text-left ${selectedMethod === m.id ? "border-[#0C72A6] bg-blue-50" : "border-gray-200"}`}>
                  <p className="font-bold">{m.label}</p>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 bg-pink-100 rounded-2xl p-5 text-center">
              {selectedMethod === "qris" && (
                <>
                  <div className="w-40 h-40 bg-white mx-auto rounded-xl flex items-center justify-center text-gray-400 font-semibold">QRIS</div>
                  <p className="text-sm text-gray-600 mt-3">Scan QR untuk melakukan pembayaran.</p>
                </>
              )}
              {selectedMethod === "ewallet" && (
                <>
                  <p className="font-semibold">Nomor E-Wallet</p>
                  <p className="text-2xl font-bold text-[#0C72A6] mt-2">0812-3456-7890</p>
                </>
              )}
              {selectedMethod === "bank" && (
                <>
                  <p className="font-semibold">Virtual Account</p>
                  <p className="text-2xl font-bold text-[#0C72A6] mt-2">8808 1234 5678 900</p>
                </>
              )}
            </div>
          </div>

          {/* KANAN - SUMMARY */}
          <div className="bg-pink-200 rounded-2xl p-6 shadow">
            <h2 className="text-xl font-bold text-pink-600 mb-5">Ringkasan Booking</h2>
            <div className="bg-white rounded-2xl p-5 space-y-3 text-sm">
              {[
                { label: "Konselor", value: bookingData.counselorName },
                { label: "Tipe", value: bookingData.type },
                { label: "Tanggal", value: bookingData.date },
                { label: "Jam", value: `${bookingData.hour} WIB` },
                { label: "Topik", value: bookingData.topic || "-" },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-gray-500">{r.label}</p>
                  <p className="font-bold capitalize">{r.value}</p>
                </div>
              ))}
              <hr />
              <div className="flex justify-between">
                <span>Biaya Konsultasi</span>
                <span className="font-semibold">{formatRupiah(price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Admin</span>
                <span className="font-semibold">{formatRupiah(adminFee)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-[#0C72A6]">{formatRupiah(total)}</span>
              </div>
            </div>

            {!paymentCompleted && (
              <button onClick={handlePayment} disabled={isProcessing}
                className="w-full bg-[#0C72A6] text-white py-3 rounded-full mt-5 font-semibold disabled:bg-gray-400">
                {isProcessing ? "Memproses..." : "Bayar Sekarang"}
              </button>
            )}

            {paymentCompleted && (
              <div className="mt-5 bg-white rounded-2xl p-5 text-sm">
                <p className="font-semibold mb-3">Upload Bukti Transfer</p>
                <input type="file" accept="image/*" onChange={handleProofFileChange}
                  className="w-full text-sm text-gray-600" />
                {proofDataUrl && (
                  <img src={proofDataUrl} alt="Bukti" className="w-full max-h-48 object-contain rounded-xl border mt-3" />
                )}
                <button onClick={handleSubmitProof} disabled={!proofDataUrl}
                  className="w-full bg-[#0C72A6] text-white py-3 rounded-full mt-4 font-semibold disabled:bg-gray-400">
                  Upload Bukti
                </button>
                {proofMessage && <p className="mt-3 text-sm text-green-600">{proofMessage}</p>}
                <button onClick={() => router.push("/consultation/my-bookings")}
                  className="w-full mt-3 border border-[#0C72A6] text-[#0C72A6] py-2 rounded-full text-sm">
                  Lihat My Bookings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}