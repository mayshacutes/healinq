"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasRun = useRef(false);

  const [message, setMessage] = useState("Menyelesaikan login...");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        const next = searchParams.get("next") || "/dashboard/user";
        const code = searchParams.get("code");

        const oauthError =
          searchParams.get("error_description") || searchParams.get("error");

        if (oauthError) {
          setErrorText(oauthError);
          setTimeout(() => router.replace("/login"), 1800);
          return;
        }

        if (!code) {
          setErrorText("Kode login dari Google tidak ditemukan.");
          setTimeout(() => router.replace("/login"), 1800);
          return;
        }

        setMessage("Menukar kode login Google...");

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setErrorText(error.message);
          setTimeout(() => router.replace("/login"), 2500);
          return;
        }

        const session = data?.session;

        if (!session?.user) {
          setErrorText("Session tidak ditemukan setelah login Google.");
          setTimeout(() => router.replace("/login"), 2500);
          return;
        }

        setMessage("Menyiapkan profil...");

        const username =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User";

        await supabase.from("profiles").upsert(
          {
            id: session.user.id,
            username,
            email: session.user.email,
            exp: 0,
            streak: 0,
            level: 1,
            nextLevelXp: 260,
          },
          {
            onConflict: "id",
          }
        );

        setMessage("Login berhasil, masuk dashboard...");

        window.location.href = next;
      } catch (err) {
        console.error(err);
        setErrorText("Terjadi kesalahan saat memproses login.");
        setTimeout(() => router.replace("/login"), 2500);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d9edf8] px-4">
      <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-md">
        {!errorText ? (
          <>
            <p className="text-lg font-semibold text-[#0c72a6]">{message}</p>
            <p className="mt-2 text-sm text-gray-500">Tunggu sebentar ya...</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-red-500">Login gagal</p>
            <p className="mt-2 text-sm text-gray-500">{errorText}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#d9edf8]">
          <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-md">
            <p className="text-lg font-semibold text-[#0c72a6]">Loading...</p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}