"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Ambil session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("No session:", sessionError);
          window.location.href = "/login";
          return;
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
          
          // Update atau buat profile
          await supabase
            .from("profiles")
            .upsert({
              id: userId,
              email: userEmail,
              role: "counselor",
              status: "Active",
              username: userEmail.split('@')[0],
              full_name: counselorData.name || userEmail.split('@')[0],
              created_at: new Date().toISOString(),
            });
          
          console.log("✅ Redirecting to /counselor/schedule");
          window.location.replace("/counselor/schedule");
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
          window.location.replace("/counselor/schedule");
          return;
        }

        // =====================
        // DEFAULT: USER DASHBOARD
        // =====================
        console.log("❌ Regular user, redirecting to /dashboard/user");
        window.location.replace("/dashboard/user");
        
      } catch (error) {
        console.error("Callback error:", error);
        window.location.href = "/login";
      }
    };

    handleCallback();
  }, []);

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