"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function ListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔥 AMBIL TYPE DARI HALAMAN SEBELUMNYA
  const type = searchParams.get("type") || "online";

  const counselors = [
    {
      id: 1,
      name: "Dr. Diandra Aliyya Khairunnisa, M.Psi",
      clients: "543 clients have consulted",
    },
    {
      id: 2,
      name: "Dr. Maysha Akmala Dina Azzahra, M.Psi",
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
    <div className="relative min-h-screen bg-[#d4effc] overflow-hidden">

      {/* ================= HEADER (STICKY) ================= */}
      <div className="sticky top-0 z-50 w-full h-[200px] flex items-center justify-center text-center">

        <Image
          src="/images/bg_consul.png"
          alt="header"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/10" />

        {/* XP + ICON */}
        <div className="absolute top-5 right-5 flex items-center gap-3 z-20">

          <div className="bg-blue-100 px-4 py-1 rounded-full flex items-center gap-2 shadow">
            <span className="text-sm font-semibold text-[#0C72A6]">XP</span>
            <span className="text-sm font-bold">1,240</span>
          </div>

          <div className="bg-pink-100 px-4 py-2 rounded-full shadow flex items-center gap-2">
            <Image src="/images/maskot1.png" alt="maskot" width={30} height={30} />
            <Image src="/images/logo.png" alt="logo" width={40} height={40} />
          </div>
        </div>

        {/* TEXT */}
        <div className="relative z-10 text-white px-4">
          <h1 className="text-4xl font-bold">
            Need Someone to Talk?
          </h1>
          <p className="text-lg italic mt-2">
            Flexible consultations, safe and private
          </p>
        </div>
      </div>

      {/* ================= ELLIPSE ================= */}
      <Image
        src="/images/Ellipse.png"
        alt="ellipse"
        width={500}
        height={500}
        className="absolute bottom-0 left-0"
      />
      <Image
        src="/images/Ellipse.png"
        alt="ellipse"
        width={400}
        height={400}
        className="absolute top-1/2 right-0"
      />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 p-10 flex flex-col items-center">

        {/* TITLE + MESSAGE BUTTON */}
        <div className="w-[80%] flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-[#0C72A6]">
            Select Counselor
          </h1>

          <button
            onClick={() => router.push("/chat")}
            className="px-5 py-2 border border-[#0C72A6] text-[#0C72A6] rounded-lg hover:bg-[#0C72A6] hover:text-white"
          >
            Message
          </button>
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-6 items-center w-full">
          {counselors.map((counselor) => (
            <div
              key={counselor.id}
              className="w-[80%] bg-white p-5 rounded-xl shadow flex justify-between items-center"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src="/images/icon_profile.png"
                    alt="profile"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>

                <div>
                  <h2 className="font-bold">{counselor.name}</h2>
                  <p className="text-sm italic text-gray-500">
                    {counselor.clients}
                  </p>
                </div>
              </div>

              {/* 🔥 KIRIM TYPE KE HALAMAN BERIKUTNYA */}
              <button
                onClick={() =>
                  router.push(
                    `/consultation/booking/${counselor.id}?type=${type}`
                  )
                }
                className="bg-[#0C72A6] text-white px-5 py-2 rounded-lg"
              >
                View Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}