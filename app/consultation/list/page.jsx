"use client";

import { useRouter } from "next/navigation";

export default function ListPage() {
  const router = useRouter();

  const counselors = [
    {
      id: 1,
      name: "Dr. Maysha Akmala Dina Azzahra, M.Psi",
      clients: "543 clients have consulted",
    },
    {
      id: 2,
      name: "Dr. Diandra Aliyya Khairunnisa, M.Psi",
      clients: "674 clients have consulted",
    },
    {
      id: 3,
      name: "Dr. Kisnaya Fianggi Maysha Putri, M.Psi",
      clients: "993 clients have consulted",
    },
    {
      id: 4,
      name: "Dr. Jessica Atalya Kriswianto, M.Psi",
      clients: "1031 clients have consulted",
    },
  ];

  return (
    <div className="min-h-screen bg-[#d4effc] p-10">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        Select Counselor
      </h1>

      <div className="flex flex-col gap-6 items-center">
        {counselors.map((counselor) => (
          <div
            key={counselor.id}
            className="w-[80%] bg-white p-5 rounded-xl shadow flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full" />

              <div>
                <h2 className="font-bold">{counselor.name}</h2>
                <p className="text-sm italic text-gray-500">
                  {counselor.clients}
                </p>
              </div>
            </div>

            {/* 🔥 BUTTON NAVIGASI */}
            <button
              onClick={() =>
                router.push(
                  `/consultation/booking/${counselor.id}`
                )
              }
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              View Detail
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}