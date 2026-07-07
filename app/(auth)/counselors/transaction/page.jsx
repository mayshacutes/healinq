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
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

export default function CounselorTransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [counselor, setCounselor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      // Ambil data counselor by email
      const { data: counselorData } = await supabase
        .from("counselors")
        .select("id, name, email")
        .or(`email.eq.${user.email},auth_email.eq.${user.email}`)
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, rowsPerPage]);

  const totalEarning = filtered
    .filter((t) => t.payments?.[0]?.payment_status === "success")
    .reduce((sum, t) => sum + (t.counselor_earning ?? t.price ?? 0), 0);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTransactions = filtered.slice(startIndex, endIndex);

  if (isLoading) {
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

      <section className="relative z-10 px-4 pt-36 pb-10 sm:px-6 sm:pt-40 md:px-10">
        <h1 className="text-3xl font-bold text-[#db2d8d] mb-1">Transactions</h1>
        <p className="text-sm text-[#0c72a6] mb-6">Riwayat konsultasi & pembayaran kamu</p>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Consultations", value: transactions.length },
            { label: "Completed", value: transactions.filter(t => t.payments?.[0]?.payment_status === "success").length },
            { label: "Total Earning", value: formatRupiah(totalEarning) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[22px] bg-white/90 p-5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              <p className="text-2xl font-bold text-[#0c72a6]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien / kode booking..."
            className="min-w-[200px] flex-1 rounded-full border border-[#e6e6e6] bg-white px-4 py-2 text-sm text-[#333] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
          {["all", "success", "pending", "failed"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${filterStatus === s
                ? "bg-[#db2d8d] text-white shadow-sm"
                : "border border-[#f3c5dc] bg-white text-[#666] hover:bg-[#fff5fa]"
                }`}>
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
          <div className="rounded-[22px] bg-white/90 p-10 text-center text-gray-400 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            Belum ada transaksi.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[22px] bg-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    {["Kode Booking", "Pasien", "Tipe", "Tanggal", "Jam", "Harga", "Metode", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedTransactions.map((t) => {
                    const pay = t.payments?.[0];
                    const payStatus = pay?.payment_status || "pending";

                    return (
                      <tr key={t.id} className="border-b border-gray-50 transition hover:bg-[#fff5fa]/60">
                        <td className="px-4 py-3 font-mono text-xs">{t.booking_code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{t.client_name || "-"}</td>
                        <td className="px-4 py-3 capitalize">{t.consultation_type || "-"}</td>
                        <td className="px-4 py-3">{formatDate(t.consultation_date)}</td>
                        <td className="px-4 py-3">{t.consultation_hour || "-"}</td>
                        <td className="px-4 py-3">{formatRupiah(t.price)}</td>
                        <td className="px-4 py-3 capitalize">{pay?.payment_method || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[payStatus] || "bg-gray-100 text-gray-500"}`}>
                            {payStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[13px] text-[#666]">
                <span>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="rounded-full border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
                <span>transactions per page</span>
              </div>

              <div className="text-[13px] text-[#666]">
                Showing {startIndex + 1} - {Math.min(endIndex, filtered.length)} of{" "}
                {filtered.length} transactions
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-[#e6e6e6] bg-white px-4 py-2 text-[13px] font-medium text-[#666] transition hover:bg-[#fff5fa] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-full bg-[#ffe7f1] px-4 py-2 text-[13px] font-medium text-[#db2d8d]">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-[#e6e6e6] bg-white px-4 py-2 text-[13px] font-medium text-[#666] transition hover:bg-[#fff5fa] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}