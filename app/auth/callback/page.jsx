"use client";

import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const getRedirectPath = useCallback(() => {
    if (typeof window === "undefined") return "/dashboard/user";
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard/user";
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Fallback: exchange code for session if getSession returns null
        if (sessionError || !session) {
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);

          if (exchangeError || !exchangeData.session) {
            console.error("Session exchange failed:", exchangeError);
            window.location.href = "/login";
            return;
          }

          session = exchangeData.session;
        }

        const userEmail = session.user.email;
        const userId = session.user.id;

        console.log("=== GOOGLE CALLBACK ===");
        console.log("Email:", userEmail);
        console.log("User ID:", userId);

        // =====================
        // CEK DI TABEL COUNSELORS
        // =====================
        const { data: counselorData } = await supabase
          .from("counselors")
          .select("id, status, name")
          .eq("email", userEmail)
          .maybeSingle();

        console.log("Counselor data:", counselorData);

        // =====================
        // JIKA COUNSELOR DAN ACTIVE
        // =====================
        if (counselorData && counselorData.status === "Active") {
          console.log("✅ DETECTED AS COUNSELOR!");

          await supabase.from("profiles").upsert({
            id: userId,
            email: userEmail,
            role: "counselor",
            status: "Active",
            username: userEmail.split('@')[0],
            full_name: counselorData.name || userEmail.split('@')[0],
            created_at: new Date().toISOString(),
          });

          console.log("✅ Redirecting to /counselor/schedule");
          window.location.replace("/counselors/schedule");
          return;
        }

        // =====================
        // CEK DI PROFILES
        // =====================
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("email", userEmail)
          .maybeSingle();

        console.log("Profile data:", profileData);

        if (profileData?.role === "counselor" && profileData?.status === "Active") {
          console.log("✅ COUNSELOR IN PROFILES!");
          window.location.replace("/counselors/schedule");
          return;
        }

        // =====================
        // BUAT PROFILE BARU UNTUK USER GOOGLE OAuth
        // =====================
        if (!profileData) {
          console.log("🆕 New Google user, creating profile...");
          await supabase.from("profiles").upsert({
            id: userId,
            email: userEmail,
            role: "user",
            status: "Active",
            username: userEmail.split('@')[0],
            full_name: session.user.user_metadata?.full_name || userEmail.split('@')[0],
            created_at: new Date().toISOString(),
          });
        }

        // =====================
        // REDIRECT (hargai ?next= jika ada)
        // =====================
        const redirectPath = getRedirectPath();
        console.log(`✅ Redirecting to ${redirectPath}`);
        window.location.replace(redirectPath);

      } catch (error) {
        console.error("Callback error:", error);
        window.location.href = "/login";
      }
    };

    handleCallback();
  }, [getRedirectPath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d9edf8]">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent mx-auto"></div>
        <p className="text-[#e1268d]">Processing login...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait</p>
      </div>
    </div>
  );
}
