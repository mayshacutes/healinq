"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ConsultationPage() {
  const router = useRouter();

  const consultationCards = [
    {
      title: "OFFLINE CONSULTATION",
      subtitle: "Face-to-Face Professional Support",
      desc: "Meet our counselor directly at our clinic for a more personal consultation experience.",
      type: "offline",
      icon: "/images/icon_offline.png",
    },
    {
      title: "ONLINE CONSULTATION",
      subtitle: "Flexible & Private Support from Anywhere",
      desc: "Connect with our professional counselors via chat — wherever you feel most comfortable.",
      type: "online",
      icon: "/images/icon_online.png",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#d4eefb] flex flex-col items-center overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="w-full h-[200px] relative flex items-center justify-center text-center">

        {/* BACKGROUND IMAGE */}
        <Image
          src="/images/bg_consul.png" 
          alt="header"
          fill
          className="object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/10" />

        {/* XP & ICON */}
        <div className="absolute top-5 right-5 flex items-center gap-3 z-20">

          {/* XP */}
          <div className="bg-blue-100 px-4 py-1 rounded-full flex items-center gap-2 shadow">
            <span className="text-sm font-semibold text-blue-700">XP</span>
            <span className="text-sm font-bold">1,240</span>
          </div>

          {/* ICON */}
          <div className="bg-pink-100 px-4 py-2 rounded-full shadow flex items-center gap-2">
            <Image
              src="/images/maskot1.png"
              alt="maskot"
              width={30}
              height={30}
              className="block"
            />
            <Image
              src="/images/logo.png"
              alt="logo"
              width={40}
              height={40}
              className="block"
            />
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

      {/* ================= ELLIPSE DECOR ================= */}
      <Image
        src="/images/Ellipse.png"
        alt="ellipse"
        width={500}
        height={500}
        className="absolute bottom-0 left-0 opacity-100"
      />

      <Image
        src="/images/Ellipse.png"
        alt="ellipse"
        width={400}
        height={400}
        className="absolute top-1/2 right-0 opacity-100"
      />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 w-full flex flex-col items-center px-6">

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-[#0c72a6] mt-10 mb-8">
          We're Here to Listen
        </h2>

        {/* CARDS */}
        <div className="flex flex-wrap gap-8 justify-center">

          {consultationCards.map((card, index) => (
            <div
              key={index}
              className="w-[450px] bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col gap-4"
            >
              {/* ICON */}
              <div className="w-12 h-12">
                <Image
                  src={card.icon}
                  alt="icon"
                  width={50}
                  height={50}
                />
              </div>

              {/* TEXT */}
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="italic text-sm">{card.subtitle}</p>
              <p className="text-gray-600">{card.desc}</p>

              {/* BUTTON */}
              <button
                onClick={() =>
                  router.push(`/consultation/list?type=${card.type}`)
                }
                className="mt-4 px-6 py-2 bg-[#0c72a6] text-white rounded-full hover:opacity-90 mx-auto"
              >
                View
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}