"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logActivity } from "@/lib/activityLogger";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email atau username wajib diisi.";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi.";
    }

    return newErrors;
  };

  // =====================
  // GOOGLE LOGIN
  // =====================
  const handleGoogleLogin = async () => {
    setErrors({});
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setErrors({
        general: error.message || "Login Google gagal.",
      });
      setIsSubmitting(false);
    }
  };

  // =====================
  // MANUAL LOGIN
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // =====================
      // CEK LOGIN ADMIN DARI TABLE admin
      // =====================
      const adminResponse = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const adminResult = await adminResponse.json().catch(() => null);

      if (adminResponse.ok && adminResult?.success) {

        // ACTIVITY LOG ADMIN
        await logActivity({
          actor_id: crypto.randomUUID(),

          actor_name: formData.identifier,
          actor_role: "Admin",

          action: "Logged into admin dashboard",

          category: "Authentication",

          status: "Completed",

          description:
            "Admin successfully logged into the dashboard.",
        });

        router.push("/admin");
        router.refresh();
        return;
      }


      // Kalau error admin-nya bukan karena "bukan admin/password salah"
      if (
        !adminResponse.ok &&
        adminResponse.status !== 401 &&
        adminResponse.status !== 403
      ) {
        setErrors({
          general:
            adminResult?.message ||
            "Terjadi kesalahan saat mengecek login admin.",
        });
        setIsSubmitting(false);
        return;
      }

      // =====================
      // LOGIN VIA SUPABASE AUTH
      // =====================
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.identifier,
        password: formData.password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        setErrors({
          general: "Email atau password salah.",
        });
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        const userEmail = data.user.email;
        
        // =====================
        // CEK DI TABEL COUNSELORS DULU (PALING PENTING)
        // =====================
        const { data: counselorData } = await supabase
          .from("counselors")
          .select("id, status")
          .eq("email", userEmail)
          .maybeSingle();

        console.log("Manual login - counselor check:", counselorData);

        // JIKA COUNSELOR DAN ACTIVE
        if (counselorData && counselorData.status === "Active") {
          // Update atau buat profile dengan role counselor
          await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: userEmail,
              role: "counselor",
              status: "Active",
              username: userEmail.split('@')[0],
              full_name: userEmail.split('@')[0],
            });
          
          console.log("✅ Manual login - redirecting to counselor");
          router.push("/counselors/schedule");
          router.refresh();
          return;
        }

        // =====================
        // CEK DI PROFILES
        // =====================
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", data.user.id)
          .single();

        console.log("User profile:", { profile, profileError });

        // ACTIVITY LOG USER / COUNSELOR LOGIN
        await logActivity({
          actor_id: data.user.id,

          actor_name:
            data.user.user_metadata?.full_name ||
            data.user.email,

          actor_role:
            profile?.role === "counselor"
              ? "Counselor"
              : "User",

          action: "Logged into account",

          category: "Authentication",

          status: "Completed",

          description:
            "User successfully logged into HealinQ.",
        });

        // Redirect berdasarkan ROLE
        if (profile?.role === "counselor") {
          if (profile?.status === "Active") {
            router.push("/counselors/schedule");
          } else {
            setErrors({
              general: "Akun counselor Anda belum aktif. Silakan hubungi admin.",
            });
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return;
          }
        } else if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard/user");
        }

        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setErrors({
        general: "Terjadi kesalahan saat login.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* BACKGROUND BLUR */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
      </div>

      <section className="relative z-10 min-h-screen w-full overflow-hidden px-3 py-4 sm:px-5 sm:py-5 lg:px-10 lg:py-6">
        {/* ILLUSTRATION */}
        <div className="absolute inset-y-0 right-0 hidden w-[80vw] xl:block">
          <img
            src="/images/Group-1054.png"
            alt="Group"
            className="h-full w-full object-cover object-[25%_center]"
          />
        </div>

        {/* FORM */}
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1600px] items-center">
          <div className="w-full max-w-[460px] lg:ml-8">
            <div className="rounded-[20px] bg-white px-5 py-8 shadow-[0_0_18px_rgba(0,0,0,0.18)] sm:px-6 sm:py-10 lg:px-8 lg:py-12">
              {/* LOGO */}
              <div className="mb-5 flex justify-center">
                <img
                  src="/images/logo.png"
                  alt="HealinQ Logo"
                  className="h-[90px] w-auto object-contain sm:h-[105px]"
                />
              </div>

              <h1 className="mb-8 text-center text-[34px] font-bold text-[#0c72a6] sm:text-[42px] lg:text-[48px]">
                Welcome!
              </h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* EMAIL / USERNAME */}
                <div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Email / Username"
                    autoComplete="username"
                    className="h-[40px] w-full rounded-full border border-neutral-400 px-5 text-[14px] focus:outline-none"
                  />

                  {errors.identifier && (
                    <p className="mt-1 text-[12px] text-red-500">
                      {errors.identifier}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="h-[40px] w-full rounded-full border border-neutral-400 px-5 text-[14px] focus:outline-none"
                  />

                  {errors.password && (
                    <p className="mt-1 text-[12px] text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* OR */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-neutral-500" />
                  <span className="text-[14px]">or</span>
                  <div className="h-px flex-1 bg-neutral-500" />
                </div>

                {/* GOOGLE LOGIN */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="flex h-[40px] w-full items-center justify-center gap-3 rounded-full border border-neutral-400 bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <img
                    src="/images/image-11.png"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  {isSubmitting ? "Redirecting..." : "Login with Google"}
                </button>

                {/* MANUAL LOGIN */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[40px] w-full rounded-full bg-[#0c72a6] text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                {/* ERROR */}
                {errors.general && (
                  <p className="text-center text-[12px] text-red-500">
                    {errors.general}
                  </p>
                )}

                {/* SIGNUP */}
                <p className="text-center text-[14px] text-[#0c72a6]">
                  Don&apos;t have account?{" "}
                  <Link href="/signup" className="underline">
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}