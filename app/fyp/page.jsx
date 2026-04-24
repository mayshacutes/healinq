"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getDailyLyric } from "@/lib/dailyLyric";

const questions = [
  "Seberapa sering Anda menikmati memecahkan teka-teki atau masalah rumit?",
  "Seberapa sering Anda tertarik mencoba hal baru yang belum pernah dilakukan?",
  "Seberapa sering Anda merasa senang membantu atau mendengarkan orang lain?",
  "Seberapa sering Anda menikmati bekerja dalam tim dibanding sendirian?",
  "Seberapa sering Anda suka membuat rencana atau mengatur sesuatu dengan detail?",
  "Seberapa sering Anda mengekspresikan diri lewat gambar, tulisan, musik, atau desain?",
  "Seberapa sering Anda penasaran dengan cara kerja sesuatu?",
  "Seberapa sering Anda merasa puas saat menyelesaikan tantangan sampai tuntas?",
  "Seberapa sering Anda menikmati berbicara di depan orang lain?",
  "Seberapa sering Anda memperhatikan perasaan orang di sekitar Anda?",
];

const answerOptions = [
  { label: "Tidak Pernah", value: 1 },
  { label: "Jarang", value: 2 },
  { label: "Kadang", value: 3 },
  { label: "Sering", value: 4 },
  { label: "Selalu", value: 5 },
];

const resultMap = [
  "Psychologist",
  "Counselor",
  "Writer",
  "Designer",
  "Researcher",
  "Teacher",
  "Strategist",
  "Creative Thinker",
  "Problem Solver",
  "Communicator",
];

function buildResults(answers) {
  const total = answers.reduce((sum, value) => sum + (value || 0), 0);

  if (total <= 15) {
    return ["Calm Thinker", "Observer", "Reflective", "Listener"];
  }
  if (total <= 25) {
    return ["Supportive", "Curious", "Communicator", "Team Player", "Empathetic"];
  }
  if (total <= 35) {
    return ["Researcher", "Problem Solver", "Strategist", "Planner", "Creative Thinker", "Listener"];
  }
  if (total <= 45) {
    return ["Counselor", "Psychologist", "Communicator", "Leader", "Creative Thinker", "Problem Solver", "Empathetic"];
  }

  return resultMap;
}

export default function FypPage() {
  const dailyLyric = useMemo(() => getDailyLyric(), []);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [results, setResults] = useState([]);

  const handleSelect = (questionIndex, value) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = value;
      return updated;
    });
  };

  const handleShuffle = () => {
    setAnswers(Array(questions.length).fill(null));
    setResults([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (answers.some((answer) => answer === null)) {
      alert("Mohon isi semua pertanyaan dulu ya.");
      return;
    }

    const matchedResults = buildResults(answers);
    setResults(matchedResults);

    setTimeout(() => {
      const resultSection = document.getElementById("match-results");
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f7]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <Image
          src="/images/Group 31.png"
          alt=""
          width={1920}
          height={281}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      <section className="relative z-10 px-4 pb-10 pt-24 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex justify-end">
            <div className="flex items-center gap-4 rounded-full bg-[#8fd0ef] px-4 py-3 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#79bde4] bg-[#dff4ff] text-[12px] font-semibold text-[#74a4d4]">
                  XP
                </div>
                <span className="text-[18px] font-bold text-white">1,240</span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#efb7d5] px-4 py-2">
                <Image
                  src="/images/maskot1.png"
                  alt="Mascot"
                  width={42}
                  height={42}
                  className="h-[42px] w-[42px] object-contain"
                />
                <Image
                  src="/images/logo.png"
                  alt="HealinQ Logo"
                  width={56}
                  height={28}
                  className="h-auto w-[56px] object-contain"
                />
              </div>
            </div>
          </div>

          <section className="mb-8 rounded-[18px] bg-[#cfeef3] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-[#a8d6ef] px-5 py-2 text-[18px] font-medium text-[#1b1b1b]">
              <span className="text-[28px] leading-none">🎵</span>
              <span>Lyric Of The Day</span>
            </div>

            <h2 className="text-[22px] font-semibold text-[#1f1f1f] md:text-[28px]">
              {dailyLyric.title}
            </h2>

            <div className="mt-4 rounded-[8px] border-l-[14px] border-[#a7dbef] pl-4 text-[18px] leading-9 text-[#2a2a2a]">
              “{dailyLyric.lyric}”
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="flex-1 text-center text-[34px] font-extrabold text-[#ea1e8c] md:text-[56px]">
                Find Your Passion
              </h1>

              <button
                type="button"
                onClick={handleShuffle}
                className="text-[54px] leading-none text-black transition hover:rotate-180"
                title="Reset form"
              >
                ↻
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="rounded-[12px] bg-white p-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)] md:p-6"
                >
                  <p className="mb-5 text-[18px] font-medium text-[#2b2b2b] md:text-[20px]">
                    {question}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    {answerOptions.map((option) => {
                      const active = answers[questionIndex] === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(questionIndex, option.value)}
                          className="flex flex-col items-center"
                        >
                          <span
                            className={`flex h-[50px] w-[50px] items-center justify-center rounded-full border-[3px] transition ${
                              active
                                ? "border-[#5eaee0] bg-[#dff4ff]"
                                : "border-[#b8d0dd] bg-white hover:border-[#7db9de]"
                            }`}
                          >
                            {active && (
                              <span className="h-[18px] w-[18px] rounded-full bg-[#5eaee0]" />
                            )}
                          </span>
                          <span className="mt-2 text-[12px] text-[#444] md:text-[13px]">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-[#79b7e8] px-12 py-3 text-[20px] font-extrabold text-white shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition hover:bg-[#68a9de]"
              >
                SUBMIT
              </button>
            </div>

            <div
              id="match-results"
              className="mt-10 rounded-[12px] bg-[#f1d9e8] px-6 py-7 shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
            >
              <h2 className="mb-6 text-center text-[34px] font-extrabold text-[#ea1e8c]">
                Your Match Results
              </h2>

              <div className="flex flex-wrap justify-center gap-4">
                {(results.length > 0 ? results : Array(10).fill("")).map((item, index) => (
                  <div
                    key={index}
                    className="min-h-[42px] min-w-[120px] rounded-[10px] bg-white px-5 py-2 text-center text-[16px] font-medium text-[#555] shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}