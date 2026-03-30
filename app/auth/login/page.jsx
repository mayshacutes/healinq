"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Username atau email wajib diisi.";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi.";
    }

    return newErrors;
  };

  const handleGoogleLogin = () => {
    alert("Login with Google masih dummy ya.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

      const matchedUser = existingUsers.find((user) => {
        const identifier = formData.identifier.toLowerCase();
        return (
          user.username.toLowerCase() === identifier ||
          user.email.toLowerCase() === identifier
        );
      });

      if (!matchedUser) {
        setErrors({
          identifier: "Username atau email tidak ditemukan.",
        });
        setIsSubmitting(false);
        return;
      }

      if (matchedUser.password !== formData.password) {
        setErrors({
          password: "Password salah.",
        });
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: matchedUser.username,
          email: matchedUser.email,
        })
      );

      router.push("/dashboard/user");
    } catch {
      setErrors({
        general: "Terjadi kesalahan saat login.",
      });
      setIsSubmitting(false);
    }
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
        {/* illustration as right-side layer */}
        <div className="absolute inset-y-0 right-0 hidden w-[80vw] xl:block">
          <img
            src="/images/Group-1054.png"
            alt="Group"
            className="h-full w-full object-cover object-[25%_center]"
          />
        </div>

        {/* content wrapper */}
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1600px] items-center">
          <div className="w-full max-w-[460px] lg:ml-8">
            <div className="rounded-[20px] bg-white px-5 py-8 shadow-[0_0_18px_rgba(0,0,0,0.18)] sm:px-6 sm:py-10 lg:px-8 lg:py-12">
              <div className="mb-5 flex justify-center">
                <img
                  src="/images/logo.png"
                  alt="HealinQ Logo"
                  className="h-[90px] w-auto object-contain sm:h-[105px]"
                />
              </div>

              <h1 className="mb-8 text-center text-[34px] font-bold leading-none text-[#0c72a6] sm:text-[42px] lg:mb-10 lg:text-[48px]">
                Welcome!
              </h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                <div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Username/Email"
                    autoComplete="username"
                    className="h-[40px] w-full rounded-full border border-neutral-400 bg-white px-5 text-[14px] text-[#2c2c2c] placeholder:text-[14px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20 sm:px-6 lg:px-7"
                  />
                  {errors.identifier && (
                    <p className="mt-1.5 ml-3 text-[12px] text-red-500">
                      {errors.identifier}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="h-[40px] w-full rounded-full border border-neutral-400 bg-white px-5 text-[14px] text-[#2c2c2c] placeholder:text-[14px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20 sm:px-6 lg:px-7"
                  />
                  {errors.password && (
                    <p className="mt-1.5 ml-3 text-[12px] text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="h-px flex-1 bg-neutral-500" />
                  <span className="text-[14px] text-[#2c2c2c]">or</span>
                  <div className="h-px flex-1 bg-neutral-500" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex h-[40px] w-full items-center justify-center gap-3 rounded-full border border-neutral-400 bg-white px-6 text-[14px] font-normal text-[#2c2c2c] transition-colors hover:bg-neutral-50"
                >
                  <img
                    className="h-5 w-5 object-contain"
                    alt="Google"
                    src="/images/image-11.png"
                  />
                  <span>Login with Google</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[40px] w-full rounded-full bg-[#0c72a6] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#0a5f8a] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                {errors.general && (
                  <p className="text-center text-[12px] text-red-500">
                    {errors.general}
                  </p>
                )}

                <p className="pt-1 text-center text-[14px] text-[#0c72a6]">
                  Don&apos;t have account?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-medium underline transition-colors hover:text-[#0a5f8a]"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* mobile fallback image */}
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