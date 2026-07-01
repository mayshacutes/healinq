"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
}

function formatDate(d) {
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

const STATUS_CLASS = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

export default function CounselorTransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [counselor, setCounselor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      // Ambil data counselor by email
      const { data: counselorData } = await supabase
        .from("counselors")
        .select("id, name, email")
        .eq("email", user.email)
        .maybeSingle();

      if (!counselorData) { setIsLoading(false); return; }
      setCounselor(counselorData);

      // Ambil consultations milik counselor ini beserta payment-nya
      const { data: consultations, error } = await supabase
        .from("consultations")
        .select(`
          id,
          booking_code,
          client_name,
          consultation_type,
          consultation_date,
          consultation_hour,
          price,
          admin_fee,
          counselor_earning,
          status,
          payments (
            payment_method,
            payment_status,
            paid_at
          )
        `)
        .eq("counselor_id", counselorData.id)
        .order("consultation_date", { ascending: false });

      if (error) {
        console.error("Error:", error);
        setIsLoading(false);
        return;
      }

      setTransactions(consultations || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const payStatus = t.payments?.[0]?.payment_status || "pending";
      const matchStatus = filterStatus === "all" || payStatus === filterStatus;
      const matchSearch = !search || t.client_name?.toLowerCase().includes(search.toLowerCase())
        || t.booking_code?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [transactions, search, filterStatus]);

  const totalEarning = filtered
    .filter((t) => t.payments?.[0]?.payment_status === "paid")
    .reduce((sum, t) => sum + (t.counselor_earning || t.price || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#d9edf8] flex items-center justify-center">
        <div className="text-[#0c72a6] text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#d9edf8] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <Image src="/images/header.png" alt="Header" width={1600} height={200}
          className="absolute top-0 left-0 w-full object-cover opacity-80" />
      </div>

      <section className="relative z-10 px-6 pt-40 pb-10 sm:px-10">
        <h1 className="text-3xl font-bold text-[#db2d8d] mb-1">Transactions</h1>
        <p className="text-sm text-[#0c72a6] mb-6">Riwayat konsultasi & pembayaran kamu</p>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Consultations", value: transactions.length },
            { label: "Completed", value: transactions.filter(t => t.payments?.[0]?.payment_status === "paid").length },
            { label: "Total Earning", value: formatRupiah(totalEarning) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/70 p-5 shadow text-center">
              <p className="text-2xl font-bold text-[#0c72a6]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien / kode booking..."
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none flex-1 min-w-[200px]" />
          {["all", "paid", "pending", "failed"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${filterStatus === s ? "bg-[#db2d8d] text-white" : "bg-white text-gray-600"}`}>
              {s === "all" ? "Semua" : s}
            </button>
          ))}
        </div>

        {/* TABLE */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/70 p-10 text-center text-gray-400 shadow">
            Belum ada transaksi.
          </div>
        ) : (
          <div className="rounded-2xl bg-white/70 shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-left">
                  {["Kode Booking", "Pasien", "Tipe", "Tanggal", "Jam", "Harga", "Metode", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const pay = t.payments?.[0];
                  const payStatus = pay?.payment_status || "pending";
                  return (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-white/50">
                      <td className="px-4 py-3 font-mono text-xs">{t.booking_code || "-"}</td>
                      <td className="px-4 py-3 font-medium">{t.client_name || "-"}</td>
                      <td className="px-4 py-3 capitalize">{t.consultation_type || "-"}</td>
                      <td className="px-4 py-3">{formatDate(t.consultation_date)}</td>
                      <td className="px-4 py-3">{t.consultation_hour || "-"}</td>
                      <td className="px-4 py-3">{formatRupiah(t.price)}</td>
                      <td className="px-4 py-3 capitalize">{pay?.payment_method || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[payStatus] || "bg-gray-100 text-gray-500"}`}>
                          {payStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}