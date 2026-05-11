"use client";

import { useRouter } from "next/navigation";

export default function BackIconButton({ to, className = "" }) {
  const router = useRouter();

  const handleBack = () => {
    if (to) {
      router.push(to);
      return;
    }

    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0C72A6] shadow hover:opacity-90 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );
}