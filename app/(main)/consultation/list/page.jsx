"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

export default function ListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "online";

  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCounselors = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .eq("status", "Active")
        .order("name", { ascending: true });

      console.log("COUNSELORS DATA:", data);
      console.log("COUNSELORS ERROR:", error);

      if (error) {
        console.error("Error fetching counselors:", error);
        setErrorMessage("Gagal memuat daftar konselor. Coba muat ulang halaman.");
        setIsLoading(false);
        return;
      }

      setCounselors(data || []);
      setIsLoading(false);
    };

    fetchCounselors();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#d4effc] overflow-hidden">
      {/* HEADER */}
      <div className="sticky top-0 z-50 w-full h-[200px] flex items-center justify-center text-center">
        <Image
          src="/images/bg_consul.png"
          alt="header"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-5 left-5 z-20">
          <BackIconButton to="/consultation" />
        </div>
        <div className="relative z-10 text-white px-4">
          <h1 className="text-4xl font-bold">Need Someone to Talk?</h1>
          <p className="text-lg italic mt-2">Flexible consultations, safe and private</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 p-10 flex flex-col items-center">
        <div className="w-[80%] flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#0C72A6]">Select Counselor</h1>
            <p className="text-sm text-gray-600 mt-1 capitalize">
              Consultation type: {type}
            </p>
          </div>
          <button
            onClick={() => router.push("/consultation/my-bookings")}
            className="px-5 py-2 border border-[#0C72A6] text-[#0C72A6] rounded-lg hover:bg-[#0C72A6] hover:text-white"
          >
            My Bookings
          </button>
        </div>

        <div className="flex flex-col gap-6 items-center w-full">
          {isLoading && (
            <div className="w-[80%] flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="w-[80%] bg-white p-6 rounded-xl shadow text-center text-red-500">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && counselors.length === 0 && (
            <div className="w-[80%] bg-white p-6 rounded-xl shadow text-center text-gray-500">
              Belum ada konselor yang tersedia saat ini.
            </div>
          )}

          {!isLoading &&
            counselors.map((counselor) => (
              <div
                key={counselor.id}
                className="w-[80%] bg-white p-5 rounded-xl shadow flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={counselor.photo_url || "/images/icon_profile.png"}
                      alt="profile"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold">{counselor.name}</h2>
                    <p className="text-sm italic text-gray-500">
                      {counselor.specialty || counselor.specialization || "Konselor"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {counselor.sessions || 0} clients have consulted
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(`/consultation/booking/${counselor.id}?type=${type}`)
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