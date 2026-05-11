"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const typeFromUrl = searchParams.get("type") || "online";

    const [bookingData, setBookingData] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState("qris");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const savedBooking = localStorage.getItem("pendingBooking");

        if (savedBooking) {
            setBookingData(JSON.parse(savedBooking));
        }
    }, []);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(number);
    };

    const adminFee = 2500;
    const price = bookingData?.price || 50000;
    const total = price + adminFee;

    const handlePayment = () => {
        if (!bookingData) return;

        setIsProcessing(true);

        setTimeout(() => {
            const bookingCode = `BK-${Date.now()}`;

            const ticketData = {
                ...bookingData,
                counselorId: params.id,
                paymentMethod: selectedMethod,
                paymentStatus: "Paid",
                adminFee: adminFee,
                totalPayment: total,
                bookingCode: bookingCode,
                attendanceConfirmed: false,
                createdAt: new Date().toISOString(),
                sessionDuration: 60, // durasi sesi 60 menit
            };

            const oldBookings = JSON.parse(localStorage.getItem("myBookings")) || [];

            const updatedBookings = [...oldBookings, ticketData];

            localStorage.setItem("myBookings", JSON.stringify(updatedBookings));
            localStorage.setItem("latestTicket", JSON.stringify(ticketData));
            localStorage.removeItem("pendingBooking");

            router.push(`/consultation/ticket/${ticketData.type}?bookingCode=${bookingCode}`);
        }, 1000);
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-[#d4eefb] flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow text-center w-[420px]">
                    <h1 className="text-xl font-bold text-[#0C72A6]">
                        Booking Data Not Found
                    </h1>

                    <p className="text-sm text-gray-500 mt-3">
                        Please fill the booking form first before continuing to payment.
                    </p>

                    <button
                        onClick={() => router.push(`/consultation/booking/${params.id}?type=${typeFromUrl}`)}
                        className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full"
                    >
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

                <h1 className="text-3xl font-bold text-[#0C72A6] mb-2">
                    Payment
                </h1>

                <p className="text-gray-600 mb-8">
                    Complete your payment to confirm your consultation booking.
                </p>

                <div className="grid grid-cols-2 gap-8">

                    {/* LEFT PAYMENT METHOD */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-bold text-pink-600 mb-5">
                            Choose Payment Method
                        </h2>

                        <div className="space-y-4">

                            <button
                                onClick={() => setSelectedMethod("qris")}
                                className={`w-full p-4 rounded-xl border text-left ${selectedMethod === "qris"
                                        ? "border-[#0C72A6] bg-blue-50"
                                        : "border-gray-200"
                                    }`}
                            >
                                <p className="font-bold">QRIS</p>
                                <p className="text-sm text-gray-500">
                                    Pay using QRIS from mobile banking or e-wallet.
                                </p>
                            </button>

                            <button
                                onClick={() => setSelectedMethod("ewallet")}
                                className={`w-full p-4 rounded-xl border text-left ${selectedMethod === "ewallet"
                                        ? "border-[#0C72A6] bg-blue-50"
                                        : "border-gray-200"
                                    }`}
                            >
                                <p className="font-bold">E-Wallet</p>
                                <p className="text-sm text-gray-500">
                                    Pay using GoPay, OVO, DANA, or ShopeePay.
                                </p>
                            </button>

                            <button
                                onClick={() => setSelectedMethod("bank")}
                                className={`w-full p-4 rounded-xl border text-left ${selectedMethod === "bank"
                                        ? "border-[#0C72A6] bg-blue-50"
                                        : "border-gray-200"
                                    }`}
                            >
                                <p className="font-bold">Bank Transfer</p>
                                <p className="text-sm text-gray-500">
                                    Pay using virtual account transfer.
                                </p>
                            </button>

                        </div>

                        <div className="mt-6 bg-pink-100 rounded-2xl p-5 text-center">
                            {selectedMethod === "qris" && (
                                <>
                                    <div className="w-40 h-40 bg-white mx-auto rounded-xl flex items-center justify-center text-gray-400 font-semibold">
                                        QRIS
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3">
                                        Scan this QR code to complete your payment.
                                    </p>
                                </>
                            )}

                            {selectedMethod === "ewallet" && (
                                <>
                                    <p className="font-semibold">E-Wallet Number</p>
                                    <p className="text-2xl font-bold text-[#0C72A6] mt-2">
                                        0812-3456-7890
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Use this number for dummy payment.
                                    </p>
                                </>
                            )}

                            {selectedMethod === "bank" && (
                                <>
                                    <p className="font-semibold">Virtual Account</p>
                                    <p className="text-2xl font-bold text-[#0C72A6] mt-2">
                                        8808 1234 5678 900
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Transfer according to the total payment amount.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SUMMARY */}
                    <div className="bg-pink-200 rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-bold text-pink-600 mb-5">
                            Booking Summary
                        </h2>

                        <div className="bg-white rounded-2xl p-5 space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500">Counselor</p>
                                <p className="font-bold">{bookingData.counselorName}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Consultation Type</p>
                                <p className="font-bold capitalize">{bookingData.type}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-bold">{bookingData.date}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Hour</p>
                                <p className="font-bold">{bookingData.hour} WIB</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Topic</p>
                                <p className="font-bold">
                                    {bookingData.topic || "-"}
                                </p>
                            </div>

                            <hr />

                            <div className="flex justify-between">
                                <span>Consultation Fee</span>
                                <span className="font-semibold">{formatRupiah(price)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Admin Fee</span>
                                <span className="font-semibold">{formatRupiah(adminFee)}</span>
                            </div>

                            <hr />

                            <div className="flex justify-between text-lg">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-[#0C72A6]">
                                    {formatRupiah(total)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-[#0C72A6] text-white py-3 rounded-full mt-6 font-semibold disabled:bg-gray-400"
                        >
                            {isProcessing ? "Processing..." : "Pay Now"}
                        </button>

                        <p className="text-xs text-gray-600 mt-3 text-center">
                            This is a frontend-only payment simulation.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}