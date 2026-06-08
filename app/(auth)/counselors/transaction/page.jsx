"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getStatusClass(status) {
  if (status === "Paid") return "bg-[#dff7eb] text-[#1f9d62]";
  if (status === "Pending") return "bg-[#fff0d9] text-[#d68a1f]";
  return "bg-[#ffe1ea] text-[#d64b7f]";
}

export default function CounselorTransactionsPage() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [counselorId, setCounselorId] = useState(null);
  const [counselorName, setCounselorName] = useState("");

  useEffect(() => {
    const fetchCounselor = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Not authenticated");
        setLoading(false);
        return;
      }
      const { data: counselor, error: counselorError } = await supabase
        .from("counselors")
        .select("id, name")
        .eq("email", user.email)
        .single();
      if (counselorError) {
        console.error("Counselor not found", counselorError);
        setLoading(false);
        return;
      }
      setCounselorId(counselor.id);
      setCounselorName(counselor.name);
    };
    fetchCounselor();
  }, []);

  useEffect(() => {
    if (!counselorId) return;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("consultations")
          .select(`
            id,
            booking_code,
            client_name,
            consultation_date,
            consultation_hour,
            counselor_earning,
            payments (payment_method, payment_status, paid_at)
          `)
          .eq("counselor_id", counselorId)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const mapped = data.map((item) => {
          const payment = item.payments?.[0] || {};
          let transactionStatus = "Pending";
          if (payment.payment_status === "success") transactionStatus = "Paid";
          else if (payment.payment_status === "pending") transactionStatus = "Pending";

          return {
            id: item.id,
            bookingCode: item.booking_code,
            user: item.client_name || "Guest",
            amount: item.counselor_earning || 0,  // pendapatan bersih counselor
            date: item.consultation_date || "-",
            status: transactionStatus,
            method: payment.payment_method || "Bank Transfer",
            reference: item.booking_code,
            paymentId: payment.id,
          };
        });
        setTransactions(mapped);
      } catch (err) {
        console.error(err);
        setActionMessage("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [counselorId]);

  // Realtime subscription (optional, sama seperti sebelumnya)
  useEffect(() => {
    if (!counselorId) return;
    const subscription = supabase
      .channel("counselor-transactions")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "payments" }, () => {
        // refresh data
        const refresh = async () => {
          const { data } = await supabase
            .from("consultations")
            .select(`id,booking_code,client_name,consultation_date,consultation_hour,counselor_earning,payments(payment_method,payment_status,paid_at)`)
            .eq("counselor_id", counselorId);
          if (data) {
            const mapped = data.map((item) => ({
              id: item.id,
              bookingCode: item.booking_code,
              user: item.client_name || "Guest",
              amount: item.counselor_earning || 0,
              date: item.consultation_date,
              status: item.payments?.[0]?.payment_status === "success" ? "Paid" : "Pending",
              method: item.payments?.[0]?.payment_method || "Bank Transfer",
              reference: item.booking_code,
              paymentId: item.payments?.[0]?.id,
            }));
            setTransactions(mapped);
          }
        };
        refresh();
      })
      .subscribe();
    return () => subscription.unsubscribe();
  }, [counselorId]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = tx.user.toLowerCase().includes(search.toLowerCase()) ||
                          tx.reference.toLowerCase().includes(search.toLowerCase()) ||
                          tx.method.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" ? true : tx.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transactions, search, statusFilter]);

  const totalRevenue = transactions
    .filter((tx) => tx.status === "Paid")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const paidTransactions = transactions.filter((tx) => tx.status === "Paid").length;
  const pendingTransactions = transactions.filter((tx) => tx.status === "Pending").length;
  const failedTransactions = transactions.filter((tx) => tx.status === "Failed").length;

  const handleExportData = () => {
    const rows = [
      ["Reference", "User", "Amount", "Date", "Status", "Method"],
      ...filteredTransactions.map((tx) => [
        tx.reference,
        tx.user,
        tx.amount,
        tx.date,
        tx.status,
        tx.method,
      ]),
    ];
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "counselor-transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionMessage("Transaction data exported successfully.");
  };

  const handleFilterPaid = () => {
    setStatusFilter("Paid");
    setIsStatusOpen(false);
    setActionMessage("Showing paid transactions only.");
  };
  const handleFilterPending = () => {
    setStatusFilter("Pending");
    setIsStatusOpen(false);
    setActionMessage("Showing pending transactions only.");
  };
  const handleViewTransaction = (tx) => {
    setSelectedTransaction(tx);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#d9edf8] flex items-center justify-center">
        <div className="text-[#0c72a6] text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* Background decorations (sama seperti halaman admin) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <Image src="/images/header.png" alt="Header Decoration" width={1600} height={200} className="absolute top-0 left-0 w-full object-cover opacity-80" />
      </div>

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        <div className="relative">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                My Transactions
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Track payments, revenue, and transaction status details
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="w-fit rounded-full bg-white px-5 py-2 text-[15px] font-medium text-[#e85fa7] shadow-sm">
                {formatTopDate(currentDate)}
              </div>
              {actionMessage && (
                <div className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm">
                  {actionMessage}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Total Revenue</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                {formatCurrency(totalRevenue)}
              </h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Paid Transactions</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                {paidTransactions}
              </h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Pending Payments</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                {pendingTransactions}
              </h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Failed Payments</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                {failedTransactions}
              </h3>
            </div>
          </div>

          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  Transaction Directory
                </h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">
                  Search and monitor all payment records
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Search user or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[44px] min-w-[280px] rounded-full border border-[#e6e6e6] bg-white px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                />
                <div ref={dropdownRef} className="relative min-w-[180px]">
                  <button
                    type="button"
                    onClick={() => setIsStatusOpen((prev) => !prev)}
                    className="flex h-[44px] w-full items-center rounded-full border border-[#e6e6e6] bg-white pl-5 pr-4 text-[14px] text-[#333] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                  >
                    <span className="flex-1 text-center">
                      {statusFilter === "All" ? "All Status" : statusFilter}
                    </span>
                    <span className="ml-3 shrink-0 text-[12px] text-[#666]">▼</span>
                  </button>
                  {isStatusOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[18px] border border-[#f0d8e5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      {["All", "Paid", "Pending", "Failed"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-center text-[14px] transition ${
                            statusFilter === status
                              ? "bg-[#ffe7f1] font-medium text-[#db2d8d]"
                              : "text-[#333] hover:bg-[#fff5fa]"
                          }`}
                        >
                          {status === "All" ? "All Status" : status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleExportData}
                  className="h-[44px] rounded-full bg-[#db2d8d] px-5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Export
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">User</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Amount (Earning)</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Date</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Status</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-[#f2f2f2] last:border-b-0">
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">{tx.user}</td>
                      <td className="px-4 py-4 text-[14px] font-semibold text-[#0c72a6]">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{tx.date}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleViewTransaction(tx)}
                          className="rounded-full bg-[#dff1ff] px-3 py-1.5 text-[12px] font-medium text-[#0c72a6] transition hover:opacity-90"
                        >
                          View
                        </button>
                       </td>
                     </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Payment Insights</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Top payment method</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">E-Wallet</p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Highest transaction</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {formatCurrency(Math.max(...transactions.map((tx) => tx.amount), 0))}
                  </p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Most common status</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {paidTransactions >= pendingTransactions && paidTransactions >= failedTransactions
                      ? "Paid"
                      : pendingTransactions >= failedTransactions
                      ? "Pending"
                      : "Failed"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Quick Actions</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={handleExportData} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Export Data</p>
                  <p className="mt-1 text-[12px] text-[#666]">Download transaction records</p>
                </button>
                <button onClick={handleFilterPaid} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Show Paid</p>
                  <p className="mt-1 text-[12px] text-[#666]">Filter successfully paid transactions</p>
                </button>
                <button onClick={handleFilterPending} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Review Pending</p>
                  <p className="mt-1 text-[12px] text-[#666]">Check transactions awaiting payment</p>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("All");
                    setSearch("");
                    setActionMessage("All filters have been reset.");
                  }}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Reset Filters</p>
                  <p className="mt-1 text-[12px] text-[#666]">Show all transaction records again</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal View Transaction (sama seperti sebelumnya) */}
      {showViewModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Transaction Detail</h2>
                <p className="mt-1 text-[14px] text-[#777]">Detailed payment information</p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTransaction(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Reference ID</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedTransaction.reference}</p>
              </div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">User</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedTransaction.user}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Amount (Earning)</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Date</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedTransaction.date}</p>
                </div>
              </div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Method</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedTransaction.method}</p>
              </div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Status</p>
                <div className="mt-2">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}