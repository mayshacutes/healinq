"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    return newErrors;
  };

  // GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard/user",
    });
  };

  // REGISTER SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // REGISTER KE AUTH SUPABASE
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      if (error) {
        setErrors({
          general: error.message,
        });

        setIsSubmitting(false);
        return;
      }

      const user = data.user;

      // SIMPAN KE TABLE profiles
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              username: formData.username,
              email: formData.email,
            },
          ]);

        if (profileError) {
          setErrors({
            general: profileError.message,
          });

          setIsSubmitting(false);
          return;
        }
      }

      alert("Registrasi berhasil!");

      router.push("/login");
    } catch (err) {
      setErrors({
        general: "Terjadi kesalahan saat registrasi.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* background blur blobs */}
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
        {/* illustration */}
        <div className="absolute inset-y-0 right-0 hidden w-[80vw] xl:block">
          <img
            src="/images/Group-1054.png"
            alt="Group"
            className="h-full w-full object-cover object-[25%_center]"
          />
        </div>

        {/* content */}
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1600px] items-center">
          <div className="w-full max-w-[460px] lg:ml-8">
            <div className="rounded-[20px] bg-white px-5 py-8 shadow-[0_0_18px_rgba(0,0,0,0.18)] sm:px-6 sm:py-10 lg:px-8 lg:py-12">
              <h1 className="mb-8 text-center text-[34px] font-bold leading-none text-[#0c72a6] sm:text-[42px] lg:mb-10 lg:text-[48px]">
                Sign Up
              </h1>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
                noValidate
              >
                {/* USERNAME */}
                <div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    autoComplete="username"
                    className="h-[40px] w-full rounded-full border border-neutral-400 bg-white px-5 text-[14px]"
                  />

                  {errors.username && (
                    <p className="mt-1.5 ml-3 text-[12px] text-red-500">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    autoComplete="email"
                    className="h-[40px] w-full rounded-full border border-neutral-400 bg-white px-5 text-[14px]"
                  />

                  {errors.email && (
                    <p className="mt-1.5 ml-3 text-[12px] text-red-500">
                      {errors.email}
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
                    autoComplete="new-password"
                    className="h-[40px] w-full rounded-full border border-neutral-400 bg-white px-5 text-[14px]"
                  />

                  {errors.password && (
                    <p className="mt-1.5 ml-3 text-[12px] text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi Password"
                    autoComplete="new-password"
                    className="h-[40px] w-full rounded-full border border-neutral-400 bg-white px-5 text-[14px]"
                  />

                  {errors.confirmPassword && (
                    <p className="mt-1.5 ml-3 text-[12px] text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* OR */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="h-px flex-1 bg-neutral-500" />
                  <span className="text-[14px] text-[#2c2c2c]">or</span>
                  <div className="h-px flex-1 bg-neutral-500" />
                </div>

                {/* GOOGLE */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="flex h-[40px] w-full items-center justify-center gap-3 rounded-full border border-neutral-400 bg-white px-6 text-[14px]"
                >
                  <img
                    className="h-5 w-5 object-contain"
                    alt="Google"
                    src="/images/image-11.png"
                  />

                  <span>Register with Google</span>
                </button>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[40px] w-full rounded-full bg-[#0c72a6] px-6 text-[14px] font-medium text-white"
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>

                {/* ERROR */}
                {errors.general && (
                  <p className="text-center text-[12px] text-red-500">
                    {errors.general}
                  </p>
                )}

                {/* LOGIN */}
                <p className="pt-1 text-center text-[14px] text-[#0c72a6]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium underline"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* mobile image */}
        <div className="mt-8 block xl:hidden">
          <img
            src="/images/Group-1054.png"
            alt="Group"
            className="mx-auto h-auto w-full max-w-[700px] object-contain"
          />
        </div>
      </section>
    </main>
  );
}