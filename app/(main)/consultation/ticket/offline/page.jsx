"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Barcode from "react-barcode";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

function normalizeHour(hour) {
    return hour?.replace(".", ":") || "00:00";
}

function formatRupiah(number) {
    if (typeof number !== "number") return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);
}

export default function TicketOfflinePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingCodeFromUrl = searchParams.get("bookingCode");
    const [ticketData, setTicketData] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            if (!bookingCodeFromUrl) {
                const savedLatest = localStorage.getItem("latestTicket");
                if (savedLatest) setTicketData(JSON.parse(savedLatest));
                return;
            }
            const { data, error } = await supabase
                .from("consultations")
                .select(`*, payments (payment_method, payment_status, paid_at)`)
                .eq("booking_code", bookingCodeFromUrl)
                .single();
            if (!error && data) {
                const mapped = {
                    id: data.id,
                    bookingCode: data.booking_code,
                    counselorName: data.counselor_name,
                    type: data.consultation_type,
                    date: data.consultation_date,
                    hour: data.consultation_hour,
                    topic: data.topic,
                    totalPayment: data.price,
                    paymentMethod: data.payments?.[0]?.payment_method,
                    paymentStatus: data.payments?.[0]?.payment_status,
                    adminApproved: data.payments?.[0]?.payment_status === "Paid",
                    attendanceConfirmed: data.attendance_confirmed,
                    proofFileName: data.proof_file_name,
                    sessionDuration: data.session_duration,
                };
                setTicketData(mapped);
                setAttendanceConfirmed(mapped.attendanceConfirmed);
                localStorage.setItem("latestTicket", JSON.stringify(mapped));
            } else {
                const savedLatest = localStorage.getItem("latestTicket");
                if (savedLatest) setTicketData(JSON.parse(savedLatest));
            }
        };
        fetchTicket();
    }, [bookingCodeFromUrl]);

    useEffect(() => {
        if (!ticketData) {
            setTimeLeft("");
            return;
        }
        const interval = setInterval(() => {
            const target = new Date(`${ticketData.date}T${normalizeHour(ticketData.hour)}:00`);
            const now = new Date();
            const diff = target - now;
            if (diff <= 0) {
                setTimeLeft("Session Started");
                return;
            }
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [ticketData]);

    const handleConfirmAttendance = async () => {
        if (!ticketData) return;
        const { error } = await supabase
            .from("consultations")
            .update({ attendance_confirmed: true })
            .eq("booking_code", ticketData.bookingCode);
        if (error) {
            alert("Gagal mengupdate kehadiran");
            return;
        }
        const updatedTicket = { ...ticketData, attendanceConfirmed: true };
        const oldBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
        const updatedBookings = oldBookings.map((b) =>
            b.bookingCode === updatedTicket.bookingCode ? updatedTicket : b
        );
        localStorage.setItem("myBookings", JSON.stringify(updatedBookings));
        localStorage.setItem("latestTicket", JSON.stringify(updatedTicket));
        setTicketData(updatedTicket);
        setAttendanceConfirmed(true);
        setShowPopup(false);
        alert("Attendance confirmed!");
    };

    if (!ticketData) {
        return (
            <div className="min-h-screen bg-[#d4eefb] flex items-center justify-center p-10">
                <div className="bg-white rounded-2xl p-8 shadow text-center w-full max-w-lg">
                    <h1 className="text-2xl font-bold text-[#0C72A6]">Ticket Not Found</h1>
                    <p className="mt-3 text-gray-600">Data tiket tidak ditemukan.</p>
                </div>
            </div>
        );
    }

    const { counselorName: name, date, hour, bookingCode, topic, totalPayment, paymentMethod, paymentStatus, adminApproved } = ticketData;
    const isPaymentVerified = paymentStatus === "success";
    const bookingStatusLabel = paymentStatus === "pending" ? "Pending Verification" : isPaymentVerified ? "Paid & Verified" : paymentStatus || "Unknown";
    const bookingStatusClass = isPaymentVerified ? "bg-green-100 text-green-600" : paymentStatus === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700";

    return (
        <div className="min-h-screen bg-[#d4eefb] flex flex-col items-center justify-center py-10">
            <div className="absolute top-6 left-6"><BackIconButton to="/consultation" /></div>
            <div className="relative w-[900px]">
                <Image src="/images/ticket.png" alt="ticket" width={900} height={420} />
                <div className="absolute inset-0 flex px-10 py-8">
                    <div className="w-[68%] pr-6">
                        <div className="bg-pink-500 text-white text-center py-2 rounded-t-xl font-semibold">Booking Confirmed!</div>
                        <div className="bg-[#f3f3f3] p-4 rounded-b-xl space-y-4">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full" />
                                <div className="flex-1">
                                    <p className="font-bold">{name}</p>
                                    <p className="text-sm text-gray-600">Psikolog Klinis | Offline</p>
                                    <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${bookingStatusClass}`}>{bookingStatusLabel}</span>
                                    <p className="mt-2 text-sm text-gray-600">{date}</p>
                                </div>
                                <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs"><p className="font-semibold">Time</p><p>{hour} WIB</p></div>
                            </div>
                            <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs"><p className="font-semibold">Booking Code</p><p className="text-pink-600 font-semibold">{bookingCode}</p></div>
                            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl text-xs text-gray-700">
                                <div><p className="font-semibold">Session Type</p><p>Offline Consultation</p></div>
                                <div><p className="font-semibold">Payment</p><p>{paymentMethod || "-"}</p></div>
                                <div><p className="font-semibold">Status</p><p>{bookingStatusLabel}</p></div>
                                <div><p className="font-semibold">Total</p><p>{formatRupiah(totalPayment)}</p></div>
                                <div><p className="font-semibold">Proof</p><p>{ticketData.proofFileName || "Not uploaded"}</p></div>
                                <div><p className="font-semibold">Admin Verified</p><p>{adminApproved ? "Yes" : "No"}</p></div>
                            </div>
                            <div><p className="text-sm mb-1">☐ Consultation Preview</p><div className="h-16 bg-gray-200 rounded-lg p-2 text-xs text-gray-600 overflow-hidden">{topic || "No topic written."}</div></div>
                        </div>
                    </div>
                    <div className="w-[32%] flex items-center justify-center border-l-2 border-dashed border-pink-300">
                        <div className="rotate-90"><Barcode value={bookingCode} height={80} width={1.5} displayValue={false} /></div>
                    </div>
                </div>
            </div>
            <div className="mt-12 text-center">
                <p className="text-xl font-medium">Your session will start in:</p>
                <h1 className="text-4xl font-bold text-pink-500 mt-2">{timeLeft}</h1>
                <button onClick={() => { if (!isPaymentVerified) { alert("Bukti transfer belum diverifikasi. Tunggu konfirmasi admin/konselor terlebih dahulu."); return; } if (!attendanceConfirmed) setShowPopup(true); }} disabled={attendanceConfirmed} className={`mt-5 px-6 py-2 rounded-full font-semibold ${attendanceConfirmed ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-pink-300 text-pink-700 hover:opacity-90"}`}>
                    {attendanceConfirmed ? "Confirmed" : isPaymentVerified ? "Confirm Attendance" : "Waiting for Verification"}
                </button>
                <button onClick={() => router.push("/consultation/my-bookings")} className="block mx-auto mt-3 px-6 py-2 bg-white text-[#0C72A6] rounded-full font-semibold hover:opacity-90">My Bookings</button>
            </div>
            {showPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-[350px] text-center shadow-lg">
                        <h2 className="text-lg font-bold mb-3">Confirm Your Attendance</h2>
                        <p className="text-sm text-gray-600 mb-5">By confirming your attendance, you are committing to attend this session. Failure to show up may result in restrictions or suspension of your account.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleConfirmAttendance} className="px-4 py-2 bg-pink-500 text-white rounded-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}