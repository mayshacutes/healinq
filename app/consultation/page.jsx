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
      icon: "/images/vector.png",
    },
    {
      title: "ONLINE CONSULTATION",
      subtitle: "Flexible & Private Support from Anywhere",
      desc: "Connect with our professional counselors via chat — wherever you feel most comfortable.",
      type: "online",
      icon: "/images/vector.svg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#d4eefb] flex flex-col items-center p-10">

      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">
          Need Someone to Talk?
        </h1>
        <p className="text-lg italic mt-2">
          Flexible consultations, safe and private
        </p>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold text-[#0c72a6] mb-8">
        We're Here to Listen
      </h2>

      {/* CARDS */}
      <div className="flex flex-wrap gap-8 justify-center">
        {consultationCards.map((card, index) => (
          <div
            key={index}
            className="w-[350px] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
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
              className="mt-4 bg-[#0c72a6] text-white py-2 rounded-full hover:opacity-90"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}