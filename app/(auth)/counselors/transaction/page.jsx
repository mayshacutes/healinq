"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const initialTransactions = [
  {
    id: 1,
    user: "Alya Putri",
    counselor: "Dr. Aulia Rahman",
    amount: 75000,
    date: "Mar 28, 2026",
    status: "Paid",
    method: "E-Wallet",
    sessionType: "Chat Counseling",
    reference: "TRX-1001",
  },
  {
    id: 2,
    user: "Nadhif Ramadhan",
    counselor: "Dr. Nabila Putri",
    amount: 100000,
    date: "Mar 27, 2026",
    status: "Pending",
    method: "Bank Transfer",
    sessionType: "Video Consultation",
    reference: "TRX-1002",
  },
  {
    id: 3,
    user: "Citra Maharani",
    counselor: "Dr. Farhan Yusuf",
    amount: 85000,
    date: "Mar 26, 2026",
    status: "Failed",
    method: "E-Wallet",
    sessionType: "Voice Session",
    reference: "TRX-1003",
  },
  {
    id: 4,
    user: "Raka Pratama",
    counselor: "Dr. Keisha Amanda",
    amount: 120000,
    date: "Mar 25, 2026",
    status: "Paid",
    method: "Credit Card",
    sessionType: "Video Consultation",
    reference: "TRX-1004",
  },
  {
    id: 5,
    user: "Salwa Nabila",
    counselor: "Dr. Salma Nadhira",
    amount: 90000,
    date: "Mar 24, 2026",
    status: "Pending",
    method: "Bank Transfer",
    sessionType: "Chat Counseling",
    reference: "TRX-1005",
  },
  {
    id: 6,
    user: "Kevin Saputra",
    counselor: "Dr. Rafi Pradana",
    amount: 110000,
    date: "Mar 23, 2026",
    status: "Paid",
    method: "Credit Card",
    sessionType: "Video Consultation",
    reference: "TRX-1006",
  },
];

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
  if (status === "Paid") {
    return "bg-[#dff7eb] text-[#1f9d62]";
  }
  if (status === "Pending") {
    return "bg-[#fff0d9] text-[#d68a1f]";
  }
  return "bg-[#ffe1ea] text-[#d64b7f]";
}

export default function AdminTransactionsPage() {
  const dropdownRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!actionMessage) return;

    const timer = setTimeout(() => {
      setActionMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [actionMessage]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.user.toLowerCase().includes(search.toLowerCase()) ||
        tx.counselor.toLowerCase().includes(search.toLowerCase()) ||
        tx.reference.toLowerCase().includes(search.toLowerCase()) ||
        tx.method.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" ? true : tx.status === statusFilter;

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
      [
        "Reference",
        "User",
        "Counselor",
        "Session Type",
        "Method",
        "Amount",
        "Date",
        "Status",
      ],
      ...filteredTransactions.map((tx) => [
        tx.reference,
        tx.user,
        tx.counselor,
        tx.sessionType,
        tx.method,
        tx.amount,
        tx.date,
        tx.status,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "transaction-history.csv");
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <Image
          src="/images/header.png"
          alt="Header Decoration"
          width={1600}
          height={200}
          className="absolute top-0 left-0 w-full object-cover opacity-80"
        />
      </div>

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        <div className="relative">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                Transaction History
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
                  placeholder="Search user, counselor, or reference..."
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
                    <span className="ml-3 shrink-0 text-[12px] text-[#666]">
                      ▼
                    </span>
                  </button>

                  {isStatusOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[18px] border border-[#f0d8e5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      {["All", "Paid", "Pending", "Failed"].map((status) => (
                        <button
                          key={status}
                          type="button"
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
                  type="button"
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
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Counselor
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-[#f2f2f2] last:border-b-0"
                    >
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">
                        {tx.user}
                      </td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {tx.counselor}
                      </td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {tx.date}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
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
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]"
                      >
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
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                Payment Insights
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Top payment method</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    E-Wallet
                  </p>
                </div>

                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Highest transaction</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {formatCurrency(
                      Math.max(...transactions.map((tx) => tx.amount))
                    )}
                  </p>
                </div>

                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Most common status</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {paidTransactions >= pendingTransactions &&
                    paidTransactions >= failedTransactions
                      ? "Paid"
                      : pendingTransactions >= failedTransactions
                      ? "Pending"
                      : "Failed"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                Quick Actions
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Export Data
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Download transaction records
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleFilterPaid}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Show Paid
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Filter successfully paid transactions
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleFilterPending}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Review Pending
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Check transactions awaiting payment
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("All");
                    setSearch("");
                    setActionMessage("All filters have been reset.");
                  }}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Reset Filters
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Show all transaction records again
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showViewModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Transaction Detail
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Detailed payment information for this transaction
                </p>
              </div>

              <button
                type="button"
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
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedTransaction.reference}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">User</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedTransaction.user}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Counselor</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedTransaction.counselor}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Amount</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Date</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedTransaction.date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Method</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedTransaction.method}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Session Type</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedTransaction.sessionType}
                  </p>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Status</p>
                <div className="mt-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(
                      selectedTransaction.status
                    )}`}
                  >
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
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