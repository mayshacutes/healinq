"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") || "online";

  const [bookingData, setBookingData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofDataUrl, setProofDataUrl] = useState(null);
  const [proofMessage, setProofMessage] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking));
    } else {
      router.push(`/consultation/list?type=${typeFromUrl}`);
    }
  }, [typeFromUrl, router]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const adminFee = 2500;
  // ✅ PERBAIKAN: Tentukan harga berdasarkan tipe konsultasi, abaikan bookingData.price yang salah
  const price = bookingData?.type === "offline" ? 75000 : 50000;
  const total = price + adminFee;

  const updateStoredBooking = (updatedTicket) => {
    const oldBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    const updatedBookings = oldBookings.map((booking) =>
      booking.bookingCode === updatedTicket.bookingCode ? updatedTicket : booking
    );
    localStorage.setItem("myBookings", JSON.stringify(updatedBookings));
    localStorage.setItem("latestTicket", JSON.stringify(updatedTicket));
  };

  const handlePayment = async () => {
    if (!bookingData) {
      alert("Data booking tidak ditemukan.");
      return;
    }
    if (paymentCompleted) {
      alert("Pembayaran sudah diproses.");
      return;
    }
    setIsProcessing(true);
    try {
      const bookingCode = `BK-${Date.now()}`;
      const { data: consultation, error: consultError } = await supabase
        .from("consultations")
        .insert([{
          booking_code: bookingCode,
          counselor_id: params.id || 'unknown',
          counselor_name: bookingData.counselorName,
          client_name: localStorage.getItem("userName") || "Guest",
          consultation_type: bookingData.type,
          consultation_date: bookingData.date,
          consultation_hour: bookingData.hour,
          topic: bookingData.topic,
          price: total,
          status: "pending",
          session_duration: 60,
          attendance_confirmed: false,
          proof_uploaded: false,
        }])
        .select();
      if (consultError) throw consultError;
      const consultationId = consultation[0].id;

      const { error: payError } = await supabase
        .from("payments")
        .insert([{
          consultation_id: consultationId,
          payment_method: selectedMethod,
          payment_status: "pending",
          paid_at: null,
        }]);
      if (payError) throw payError;

      const newBooking = {
        id: consultationId,
        bookingCode,
        counselorId: params.id,
        counselorName: bookingData.counselorName,
        type: bookingData.type,
        date: bookingData.date,
        hour: bookingData.hour,
        topic: bookingData.topic,
        paymentMethod: selectedMethod,
        paymentStatus: "pending",
        totalPayment: total,
        attendanceConfirmed: false,
        adminApproved: false,
        proofUploaded: false,
        proofFileName: null,
        proofFileUrl: null,
        sessionDuration: 60,
      };

      const oldBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
      localStorage.setItem("myBookings", JSON.stringify([...oldBookings, newBooking]));
      localStorage.setItem("latestTicket", JSON.stringify(newBooking));
      localStorage.removeItem("pendingBooking");

      setBookingData(newBooking);
      setPaymentCompleted(true);
      setProofMessage("Pembayaran berhasil. Silakan upload bukti transfer untuk verifikasi.");
    } catch (err) {
      console.error("Payment error:", err);
      alert("Terjadi kesalahan: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProofDataUrl(reader.result);
      setProofFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofFile || !bookingData) {
      alert("Pilih file bukti pembayaran terlebih dahulu.");
      return;
    }
    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${bookingData.bookingCode}_${Date.now()}.${fileExt}`;
      const filePath = `${bookingData.bookingCode}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(filePath, proofFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("proofs")
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("consultations")
        .update({
          proof_uploaded: true,
          proof_file_name: proofFile.name,
          proof_file_url: publicUrl,
          proof_uploaded_at: new Date().toISOString(),
        })
        .eq("booking_code", bookingData.bookingCode);
      if (updateError) throw updateError;

      const updatedTicket = {
        ...bookingData,
        proofUploaded: true,
        proofFileName: proofFile.name,
        proofFileUrl: publicUrl,
      };
      updateStoredBooking(updatedTicket);
      setBookingData(updatedTicket);
      setProofMessage("Bukti transfer berhasil diupload. Menunggu verifikasi admin.");
    } catch (err) {
      console.error("Upload proof error:", err);
      alert("Gagal mengupload bukti: " + err.message);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-[#d4eefb] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow text-center w-[420px]">
          <h1 className="text-xl font-bold text-[#0C72A6]">Booking Data Not Found</h1>
          <p className="text-sm text-gray-500 mt-3">Please fill the booking form first.</p>
          <button onClick={() => router.push(`/consultation/list?type=${typeFromUrl}`)} className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full">Back to List</button>
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
        <p className="text-gray-600 mb-8">Complete your payment to confirm your consultation booking.</p>
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Payment Method */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-xl font-bold text-pink-600 mb-5">Choose Payment Method</h2>
            <div className="space-y-4">
              <button onClick={() => setSelectedMethod("qris")} className={`w-full p-4 rounded-xl border text-left ${selectedMethod === "qris" ? "border-[#0C72A6] bg-blue-50" : "border-gray-200"}`}>
                <p className="font-bold">QRIS</p>
                <p className="text-sm text-gray-500">Pay using QRIS from mobile banking or e-wallet.</p>
              </button>
              <button onClick={() => setSelectedMethod("ewallet")} className={`w-full p-4 rounded-xl border text-left ${selectedMethod === "ewallet" ? "border-[#0C72A6] bg-blue-50" : "border-gray-200"}`}>
                <p className="font-bold">E-Wallet</p>
                <p className="text-sm text-gray-500">Pay using GoPay, OVO, DANA, or ShopeePay.</p>
              </button>
              <button onClick={() => setSelectedMethod("bank")} className={`w-full p-4 rounded-xl border text-left ${selectedMethod === "bank" ? "border-[#0C72A6] bg-blue-50" : "border-gray-200"}`}>
                <p className="font-bold">Bank Transfer</p>
                <p className="text-sm text-gray-500">Pay using virtual account transfer.</p>
              </button>
            </div>
            <div className="mt-6 bg-pink-100 rounded-2xl p-5 text-center">
              {selectedMethod === "qris" && (
                <>
                  <div className="w-40 h-40 bg-white mx-auto rounded-xl flex items-center justify-center text-gray-400 font-semibold">QRIS</div>
                  <p className="text-sm text-gray-600 mt-3">Scan this QR code to complete your payment.</p>
                </>
              )}
              {selectedMethod === "ewallet" && (
                <>
                  <p className="font-semibold">E-Wallet Number</p>
                  <p className="text-2xl font-bold text-[#0C72A6] mt-2">0812-3456-7890</p>
                  <p className="text-sm text-gray-600 mt-2">Use this number for dummy payment.</p>
                </>
              )}
              {selectedMethod === "bank" && (
                <>
                  <p className="font-semibold">Virtual Account</p>
                  <p className="text-2xl font-bold text-[#0C72A6] mt-2">8808 1234 5678 900</p>
                  <p className="text-sm text-gray-600 mt-2">Transfer according to the total payment amount.</p>
                </>
              )}
            </div>
          </div>
          {/* Right: Summary & Action */}
          <div className="bg-pink-200 rounded-2xl p-6 shadow">
            <h2 className="text-xl font-bold text-pink-600 mb-5">Booking Summary</h2>
            <div className="bg-white rounded-2xl p-5 space-y-4 text-sm">
              <div><p className="text-gray-500">Counselor</p><p className="font-bold">{bookingData.counselorName}</p></div>
              <div><p className="text-gray-500">Type</p><p className="font-bold capitalize">{bookingData.type}</p></div>
              <div><p className="text-gray-500">Date</p><p className="font-bold">{bookingData.date}</p></div>
              <div><p className="text-gray-500">Hour</p><p className="font-bold">{bookingData.hour} WIB</p></div>
              <div><p className="text-gray-500">Topic</p><p className="font-bold">{bookingData.topic || "-"}</p></div>
              <hr />
              <div className="flex justify-between"><span>Consultation Fee</span><span>{formatRupiah(price)}</span></div>
              <div className="flex justify-between"><span>Admin Fee</span><span>{formatRupiah(adminFee)}</span></div>
              <hr />
              <div className="flex justify-between text-lg"><span className="font-bold">Total</span><span className="font-bold text-[#0C72A6]">{formatRupiah(total)}</span></div>
            </div>
            {!paymentCompleted ? (
              <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-[#0C72A6] text-white py-3 rounded-full mt-6 font-semibold disabled:bg-gray-400">
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            ) : (
              <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-gray-700 shadow-sm">
                <p className="font-semibold mb-3">Upload Bukti Transfer</p>
                <p className="text-xs text-gray-500 mb-4">Setelah pembayaran, unggah bukti transfer agar admin dapat memverifikasi.</p>
                <input type="file" accept="image/*" onChange={handleProofFileChange} className="w-full text-sm text-gray-600" />
                {proofDataUrl && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Preview Bukti</p>
                    <img src={proofDataUrl} alt="Bukti Transfer" className="w-full max-h-48 object-contain rounded-xl border" />
                  </div>
                )}
                <button onClick={handleSubmitProof} disabled={!proofDataUrl} className="w-full bg-[#0C72A6] text-white py-3 rounded-full mt-5 font-semibold disabled:bg-gray-400">
                  Upload Bukti
                </button>
                {proofMessage && <p className="mt-4 text-sm text-green-600">{proofMessage}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}