"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { lyricsByDay as defaultLyrics } from "@/lib/dailyLyric";

const defaultQuestions = [
  {
    id: 1,
    text: "Seberapa sering Anda menikmati memecahkan teka-teki atau masalah rumit?",
    category: "analytical",
  },
  {
    id: 2,
    text: "Seberapa sering Anda tertarik mencoba hal baru yang belum pernah dilakukan?",
    category: "explorative",
  },
  {
    id: 3,
    text: "Seberapa sering Anda merasa senang membantu atau mendengarkan orang lain?",
    category: "helping",
  },
  {
    id: 4,
    text: "Seberapa sering Anda menikmati bekerja dalam tim dibanding sendirian?",
    category: "social",
  },
  {
    id: 5,
    text: "Seberapa sering Anda suka membuat rencana atau mengatur sesuatu dengan detail?",
    category: "planning",
  },
  {
    id: 6,
    text: "Seberapa sering Anda mengekspresikan diri lewat gambar, tulisan, musik, atau desain?",
    category: "creative",
  },
  {
    id: 7,
    text: "Seberapa sering Anda penasaran dengan cara kerja sesuatu?",
    category: "analytical",
  },
  {
    id: 8,
    text: "Seberapa sering Anda merasa puas saat menyelesaikan tantangan sampai tuntas?",
    category: "analytical",
  },
  {
    id: 9,
    text: "Seberapa sering Anda menikmati berbicara di depan orang lain?",
    category: "social",
  },
  {
    id: 10,
    text: "Seberapa sering Anda memperhatikan perasaan orang di sekitar Anda?",
    category: "helping",
  },
];

const LYRICS_STORAGE_KEY = "healinq_admin_lyrics";
const QUESTIONS_STORAGE_KEY = "healinq_admin_fyp_questions";

const categoryOptions = [
  { value: "analytical", label: "Analytical" },
  { value: "explorative", label: "Explorative" },
  { value: "helping", label: "Helping" },
  { value: "social", label: "Social" },
  { value: "planning", label: "Planning" },
  { value: "creative", label: "Creative" },
];

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCategoryLabel(categoryValue) {
  const found = categoryOptions.find((item) => item.value === categoryValue);
  return found ? found.label : categoryValue;
}

export default function AdminContentPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionMessage, setActionMessage] = useState("");

  const [lyrics, setLyrics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [lyricForm, setLyricForm] = useState({
    title: "",
    lyric: "",
  });

  const [questionForm, setQuestionForm] = useState({
    text: "",
    category: "explorative",
  });

  const [editingLyric, setEditingLyric] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [showAddLyricModal, setShowAddLyricModal] = useState(false);
  const [showEditLyricModal, setShowEditLyricModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedLyrics = localStorage.getItem(LYRICS_STORAGE_KEY);
    const storedQuestions = localStorage.getItem(QUESTIONS_STORAGE_KEY);

    if (storedLyrics) {
      try {
        const parsedLyrics = JSON.parse(storedLyrics);
        if (Array.isArray(parsedLyrics) && parsedLyrics.length > 0) {
          setLyrics(parsedLyrics);
        } else {
          const normalizedDefaultLyrics = defaultLyrics.map((item, index) => ({
            id: index + 1,
            title: item.title,
            lyric: item.lyric,
          }));
          setLyrics(normalizedDefaultLyrics);
          localStorage.setItem(
            LYRICS_STORAGE_KEY,
            JSON.stringify(normalizedDefaultLyrics)
          );
        }
      } catch {
        const normalizedDefaultLyrics = defaultLyrics.map((item, index) => ({
          id: index + 1,
          title: item.title,
          lyric: item.lyric,
        }));
        setLyrics(normalizedDefaultLyrics);
        localStorage.setItem(
          LYRICS_STORAGE_KEY,
          JSON.stringify(normalizedDefaultLyrics)
        );
      }
    } else {
      const normalizedDefaultLyrics = defaultLyrics.map((item, index) => ({
        id: index + 1,
        title: item.title,
        lyric: item.lyric,
      }));
      setLyrics(normalizedDefaultLyrics);
      localStorage.setItem(
        LYRICS_STORAGE_KEY,
        JSON.stringify(normalizedDefaultLyrics)
      );
    }

    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions);
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          const normalizedQuestions = parsedQuestions
            .map((item, index) => {
              if (typeof item === "string") {
                return {
                  id: index + 1,
                  text: item,
                  category: defaultQuestions[index]?.category || "explorative",
                };
              }

              if (item && typeof item.text === "string") {
                return {
                  id: item.id || index + 1,
                  text: item.text,
                  category:
                    item.category ||
                    defaultQuestions[index]?.category ||
                    "explorative",
                };
              }

              return null;
            })
            .filter((item) => item && item.text.trim() !== "");

          if (normalizedQuestions.length > 0) {
            setQuestions(normalizedQuestions);
            localStorage.setItem(
              QUESTIONS_STORAGE_KEY,
              JSON.stringify(normalizedQuestions)
            );
          } else {
            setQuestions(defaultQuestions);
            localStorage.setItem(
              QUESTIONS_STORAGE_KEY,
              JSON.stringify(defaultQuestions)
            );
          }
        } else {
          setQuestions(defaultQuestions);
          localStorage.setItem(
            QUESTIONS_STORAGE_KEY,
            JSON.stringify(defaultQuestions)
          );
        }
      } catch {
        setQuestions(defaultQuestions);
        localStorage.setItem(
          QUESTIONS_STORAGE_KEY,
          JSON.stringify(defaultQuestions)
        );
      }
    } else {
      setQuestions(defaultQuestions);
      localStorage.setItem(
        QUESTIONS_STORAGE_KEY,
        JSON.stringify(defaultQuestions)
      );
    }
  }, []);

  useEffect(() => {
    if (!actionMessage) return;

    const timer = setTimeout(() => {
      setActionMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [actionMessage]);

  const totalLyrics = lyrics.length;
  const totalQuestions = questions.length;

  const lyricPreview = useMemo(() => {
    if (lyrics.length === 0) return null;
    return lyrics[0];
  }, [lyrics]);

  const questionPreview = useMemo(() => {
    if (questions.length === 0) return null;
    return questions[0];
  }, [questions]);

  const saveLyricsToStorage = (updatedLyrics) => {
    setLyrics(updatedLyrics);
    localStorage.setItem(LYRICS_STORAGE_KEY, JSON.stringify(updatedLyrics));
  };

  const saveQuestionsToStorage = (updatedQuestions) => {
    setQuestions(updatedQuestions);
    localStorage.setItem(
      QUESTIONS_STORAGE_KEY,
      JSON.stringify(updatedQuestions)
    );
  };

  const handleLyricFormChange = (e) => {
    const { name, value } = e.target;
    setLyricForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLyric = (e) => {
    e.preventDefault();

    if (!lyricForm.title.trim() || !lyricForm.lyric.trim()) {
      setActionMessage("Please complete the lyric title and lyric text first.");
      return;
    }

    const newLyric = {
      id: Date.now(),
      title: lyricForm.title.trim(),
      lyric: lyricForm.lyric.trim(),
    };

    const updatedLyrics = [newLyric, ...lyrics];
    saveLyricsToStorage(updatedLyrics);

    setLyricForm({
      title: "",
      lyric: "",
    });
    setShowAddLyricModal(false);
    setActionMessage("New lyric added successfully.");
  };

  const handleOpenEditLyric = (item) => {
    setEditingLyric({ ...item });
    setShowEditLyricModal(true);
  };

  const handleEditLyricChange = (e) => {
    const { name, value } = e.target;
    setEditingLyric((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEditLyric = (e) => {
    e.preventDefault();

    if (!editingLyric.title.trim() || !editingLyric.lyric.trim()) {
      setActionMessage("Please complete all lyric fields first.");
      return;
    }

    const updatedLyrics = lyrics.map((item) =>
      item.id === editingLyric.id
        ? {
            ...editingLyric,
            title: editingLyric.title.trim(),
            lyric: editingLyric.lyric.trim(),
          }
        : item
    );

    saveLyricsToStorage(updatedLyrics);
    setShowEditLyricModal(false);
    setEditingLyric(null);
    setActionMessage("Lyric updated successfully.");
  };

  const handleDeleteLyric = (lyricId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lyric?"
    );
    if (!confirmed) return;

    const updatedLyrics = lyrics.filter((item) => item.id !== lyricId);
    saveLyricsToStorage(updatedLyrics);
    setActionMessage("Lyric deleted successfully.");

    if (editingLyric?.id === lyricId) {
      setShowEditLyricModal(false);
      setEditingLyric(null);
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();

    if (!questionForm.text.trim()) {
      setActionMessage("Please write the question first.");
      return;
    }

    const newQuestion = {
      id: Date.now(),
      text: questionForm.text.trim(),
      category: questionForm.category,
    };

    const updatedQuestions = [...questions, newQuestion];
    saveQuestionsToStorage(updatedQuestions);

    setQuestionForm({
      text: "",
      category: "explorative",
    });
    setShowAddQuestionModal(false);
    setActionMessage("New FYP question added successfully.");
  };

  const handleOpenEditQuestion = (item) => {
    setEditingQuestion({ ...item });
    setShowEditQuestionModal(true);
  };

  const handleEditQuestionChange = (e) => {
    const { name, value } = e.target;
    setEditingQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEditQuestion = (e) => {
    e.preventDefault();

    if (!editingQuestion.text.trim()) {
      setActionMessage("Please complete the question field first.");
      return;
    }

    const updatedQuestions = questions.map((item) =>
      item.id === editingQuestion.id
        ? {
            ...editingQuestion,
            text: editingQuestion.text.trim(),
          }
        : item
    );

    saveQuestionsToStorage(updatedQuestions);
    setShowEditQuestionModal(false);
    setEditingQuestion(null);
    setActionMessage("FYP question updated successfully.");
  };

  const handleDeleteQuestion = (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    const updatedQuestions = questions.filter((item) => item.id !== questionId);
    saveQuestionsToStorage(updatedQuestions);
    setActionMessage("FYP question deleted successfully.");

    if (editingQuestion?.id === questionId) {
      setShowEditQuestionModal(false);
      setEditingQuestion(null);
    }
  };

  const handleResetToDefault = () => {
    const confirmed = window.confirm(
      "Reset all lyrics and FYP questions to default data?"
    );
    if (!confirmed) return;

    const normalizedDefaultLyrics = defaultLyrics.map((item, index) => ({
      id: index + 1,
      title: item.title,
      lyric: item.lyric,
    }));

    saveLyricsToStorage(normalizedDefaultLyrics);
    saveQuestionsToStorage(defaultQuestions);
    setActionMessage("Content has been reset to default.");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <Image
          src="/images/header.png"
          alt="Header Decoration"
          width={1600}
          height={200}
          className="absolute top-0 left-0 w-full object-cover opacity-80"
        />
      </div>

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        <div className="relative">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                Content Management
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Manage lyrics and FYP questions for the user experience
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="w-fit rounded-full bg-white px-5 py-2 text-[15px] font-medium text-[#e85fa7] shadow-sm">
                {formatTopDate(currentDate)}
              </div>

              {actionMessage && (
                <div className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm">
                  {actionMessage}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Total Lyrics</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                {totalLyrics}
              </h3>
            </div>

            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Total FYP Questions</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                {totalQuestions}
              </h3>
            </div>

            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Lyric Preview</p>
              <h3 className="mt-2 line-clamp-1 text-[18px] font-bold text-[#0c72a6]">
                {lyricPreview?.title || "-"}
              </h3>
            </div>

            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Question Preview</p>
              <h3 className="mt-2 line-clamp-2 text-[16px] font-bold text-[#0c72a6]">
                {questionPreview?.text || "-"}
              </h3>
            </div>
          </div>

          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  Lyric Management
                </h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">
                  Add, edit, and remove lyrics shown in Lyric Of The Day
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddLyricModal(true)}
                className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
              >
                + Add Lyric
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Lyric
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lyrics.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#f2f2f2] last:border-b-0"
                    >
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">
                        {item.title}
                      </td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        <div className="max-w-[460px] line-clamp-3">{item.lyric}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditLyric(item)}
                            className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLyric(item.id)}
                            className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {lyrics.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]"
                      >
                        No lyrics available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  FYP Question Management
                </h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">
                  Add, edit, and remove questions shown on Find Your Passion
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddQuestionModal(true)}
                className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
              >
                + Add Question
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Question
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#f2f2f2] last:border-b-0"
                    >
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">
                        {item.text}
                      </td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {getCategoryLabel(item.category)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(item)}
                            className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(item.id)}
                            className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {questions.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]"
                      >
                        No questions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                Content Insights
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Latest lyric title</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {lyrics[0]?.title || "-"}
                  </p>
                </div>

                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Latest question</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {questions[questions.length - 1]?.text || "-"}
                  </p>
                </div>

                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Content source</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    Local Storage
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                Quick Actions
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowAddLyricModal(true)}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Add Lyric
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Create a new lyric entry
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(true)}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Add Question
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Create a new FYP question
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80 sm:col-span-2"
                >
                  <p className="text-[15px] font-semibold text-[#db2d8d]">
                    Reset to Default
                  </p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    Restore default lyrics and FYP questions
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showAddLyricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Add New Lyric
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Fill in the lyric title and text below
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddLyricModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLyric} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Song title"
                value={lyricForm.title}
                onChange={handleLyricFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <textarea
                name="lyric"
                placeholder="Write the lyric text here..."
                value={lyricForm.lyric}
                onChange={handleLyricFormChange}
                rows={6}
                className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLyricModal(false)}
                  className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Save Lyric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditLyricModal && editingLyric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Edit Lyric
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Update the selected lyric
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditLyricModal(false);
                  setEditingLyric(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditLyric} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Song title"
                value={editingLyric.title}
                onChange={handleEditLyricChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <textarea
                name="lyric"
                placeholder="Write the lyric text here..."
                value={editingLyric.lyric}
                onChange={handleEditLyricChange}
                rows={6}
                className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteLyric(editingLyric.id)}
                  className="rounded-full bg-[#f3f3f3] px-5 py-2.5 text-[14px] font-medium text-[#666] transition hover:bg-[#ebebeb]"
                >
                  Delete Lyric
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditLyricModal(false);
                      setEditingLyric(null);
                    }}
                    className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Add New FYP Question
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Write the question and choose its category
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <textarea
                name="text"
                placeholder="Write the FYP question here..."
                value={questionForm.text}
                onChange={handleQuestionFormChange}
                rows={5}
                className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#666]">
                  Category
                </label>
                <select
                  name="category"
                  value={questionForm.category}
                  onChange={handleQuestionFormChange}
                  className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                >
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Edit FYP Question
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Update the selected FYP question and category
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditQuestion} className="space-y-4">
              <textarea
                name="text"
                placeholder="Write the FYP question here..."
                value={editingQuestion.text}
                onChange={handleEditQuestionChange}
                rows={5}
                className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#666]">
                  Category
                </label>
                <select
                  name="category"
                  value={editingQuestion.category}
                  onChange={handleEditQuestionChange}
                  className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                >
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(editingQuestion.id)}
                  className="rounded-full bg-[#f3f3f3] px-5 py-2.5 text-[14px] font-medium text-[#666] transition hover:bg-[#ebebeb]"
                >
                  Delete Question
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditQuestionModal(false);
                      setEditingQuestion(null);
                    }}
                    className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}