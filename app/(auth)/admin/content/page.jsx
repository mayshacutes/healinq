"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { lyricAPI, jarAPI, questionAPI, seedDefaultData } from "@/lib/supabaseApi";

// ========== FUNGSI FORMAT TANGGAL ==========
function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ========== FUNGSI GET CATEGORY LABEL ==========
function getCategoryLabel(categoryValue) {
  const categoryOptions = [
    { value: "analytical", label: "Analytical" },
    { value: "explorative", label: "Explorative" },
    { value: "helping", label: "Helping" },
    { value: "social", label: "Social" },
    { value: "planning", label: "Planning" },
    { value: "creative", label: "Creative" },
  ];
  
  const found = categoryOptions.find((item) => item.value === categoryValue);
  return found ? found.label : categoryValue;
}

// ========== CATEGORY OPTIONS ==========
const categoryOptions = [
  { value: "analytical", label: "Analytical" },
  { value: "explorative", label: "Explorative" },
  { value: "helping", label: "Helping" },
  { value: "social", label: "Social" },
  { value: "planning", label: "Planning" },
  { value: "creative", label: "Creative" },
];

const jarOfHappinessCategories = [
  { value: "Self-Compassion & Healing", label: "Self-Compassion & Healing" },
  { value: "Mindfulness & Presence", label: "Mindfulness & Presence" },
  { value: "Gratitude & Resilience", label: "Gratitude & Resilience" },
];

// ========== MAIN COMPONENT ==========
export default function AdminContentPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Data state
  const [lyrics, setLyrics] = useState([]);
  const [jarOfHappiness, setJarOfHappiness] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Form states
  const [lyricForm, setLyricForm] = useState({ title: "", lyric: "" });
  const [jarForm, setJarForm] = useState({ title: "", content: "", category: "Self-Compassion & Healing" });
  const [questionForm, setQuestionForm] = useState({ text: "", category: "explorative" });

  // Editing states
  const [editingLyric, setEditingLyric] = useState(null);
  const [editingJar, setEditingJar] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Modal states
  const [showAddLyricModal, setShowAddLyricModal] = useState(false);
  const [showEditLyricModal, setShowEditLyricModal] = useState(false);
  const [showAddJarModal, setShowAddJarModal] = useState(false);
  const [showEditJarModal, setShowEditJarModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);

  // Load data from Supabase
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [lyricsData, jarData, questionsData] = await Promise.all([
        lyricAPI.getAll(),
        jarAPI.getAll(),
        questionAPI.getAll()
      ]);
      setLyrics(lyricsData || []);
      setJarOfHappiness(jarData || []);
      setQuestions(questionsData || []);
      console.log("Data loaded:", { lyricsData, jarData, questionsData });
    } catch (error) {
      console.error("Error loading data:", error);
      setActionMessage("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await seedDefaultData();
      await loadAllData();
    };
    init();
  }, []);

  // Timer for date
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss action message
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // ========== LYRIC HANDLERS ==========
  const handleAddLyric = async (e) => {
    e.preventDefault();
    if (!lyricForm.title.trim() || !lyricForm.lyric.trim()) {
      setActionMessage("Please complete all fields");
      return;
    }
    try {
      await lyricAPI.create(lyricForm.title.trim(), lyricForm.lyric.trim());
      await loadAllData();
      setLyricForm({ title: "", lyric: "" });
      setShowAddLyricModal(false);
      setActionMessage("✅ Lyric added successfully");
    } catch (error) {
      console.error(error);
      setActionMessage("❌ Failed to add lyric: " + error.message);
    }
  };

  const handleUpdateLyric = async (e) => {
    e.preventDefault();
    if (!editingLyric.title.trim() || !editingLyric.lyric.trim()) {
      setActionMessage("Please complete all fields");
      return;
    }
    try {
      await lyricAPI.update(editingLyric.id, editingLyric.title.trim(), editingLyric.lyric.trim());
      await loadAllData();
      setShowEditLyricModal(false);
      setEditingLyric(null);
      setActionMessage("✅ Lyric updated");
    } catch (error) {
      setActionMessage("❌ Failed to update lyric");
    }
  };

  const handleDeleteLyric = async (id) => {
    if (!confirm("Delete this lyric?")) return;
    try {
      await lyricAPI.delete(id);
      await loadAllData();
      setActionMessage("✅ Lyric deleted");
      if (editingLyric?.id === id) {
        setShowEditLyricModal(false);
        setEditingLyric(null);
      }
    } catch (error) {
      setActionMessage("❌ Failed to delete lyric");
    }
  };

  // ========== JAR OF HAPPINESS HANDLERS ==========
  const handleAddJar = async (e) => {
    e.preventDefault();
    if (!jarForm.title.trim() || !jarForm.content.trim()) {
      setActionMessage("Please complete all fields");
      return;
    }
    try {
      await jarAPI.create(jarForm.title.trim(), jarForm.content.trim(), jarForm.category);
      await loadAllData();
      setJarForm({ title: "", content: "", category: "Self-Compassion & Healing" });
      setShowAddJarModal(false);
      setActionMessage("✅ Affirmation added");
    } catch (error) {
      setActionMessage("❌ Failed to add affirmation");
    }
  };

  const handleUpdateJar = async (e) => {
    e.preventDefault();
    try {
      await jarAPI.update(editingJar.id, editingJar.title.trim(), editingJar.content.trim(), editingJar.category);
      await loadAllData();
      setShowEditJarModal(false);
      setEditingJar(null);
      setActionMessage("✅ Affirmation updated");
    } catch (error) {
      setActionMessage("❌ Failed to update");
    }
  };

  const handleDeleteJar = async (id) => {
    if (!confirm("Delete this affirmation?")) return;
    try {
      await jarAPI.delete(id);
      await loadAllData();
      setActionMessage("✅ Affirmation deleted");
    } catch (error) {
      setActionMessage("❌ Failed to delete");
    }
  };

  // ========== QUESTION HANDLERS ==========
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.text.trim()) {
      setActionMessage("Please write the question");
      return;
    }
    try {
      await questionAPI.create(questionForm.text.trim(), questionForm.category);
      await loadAllData();
      setQuestionForm({ text: "", category: "explorative" });
      setShowAddQuestionModal(false);
      setActionMessage("✅ Question added");
    } catch (error) {
      setActionMessage("❌ Failed to add question");
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await questionAPI.update(editingQuestion.id, editingQuestion.text.trim(), editingQuestion.category);
      await loadAllData();
      setShowEditQuestionModal(false);
      setEditingQuestion(null);
      setActionMessage("✅ Question updated");
    } catch (error) {
      setActionMessage("❌ Failed to update");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      await questionAPI.delete(id);
      await loadAllData();
      setActionMessage("✅ Question deleted");
    } catch (error) {
      setActionMessage("❌ Failed to delete");
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm("Reset all content to default?")) return;
    try {
      for (const lyric of lyrics) {
        await lyricAPI.delete(lyric.id);
      }
      for (const item of jarOfHappiness) {
        await jarAPI.delete(item.id);
      }
      for (const q of questions) {
        await questionAPI.delete(q.id);
      }
      await seedDefaultData();
      await loadAllData();
      setActionMessage("✅ Reset to default completed");
    } catch (error) {
      setActionMessage("❌ Failed to reset");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d9edf8]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent"></div>
          <p className="text-[#e1268d]">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <Image src="/images/header.png" alt="Header Decoration" width={1600} height={200} className="absolute top-0 left-0 w-full object-cover opacity-80" />
      </div>

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        <div className="relative">
          {/* Header */}
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">Content Management</h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">Manage lyrics, Jar of Happiness items, and FYP questions</p>
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

          {/* Stat Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Total Lyrics</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{lyrics.length}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Jar of Happiness</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{jarOfHappiness.length}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">FYP Questions</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{questions.length}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Latest Lyric</p>
              <h3 className="mt-2 line-clamp-1 text-[18px] font-bold text-[#0c72a6]">{lyrics[0]?.title || "-"}</h3>
            </div>
          </div>

          {/* LYRICS TABLE */}
          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">Lyric Management</h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">Add, edit, and remove lyrics shown in Lyric Of The Day</p>
              </div>
              <button onClick={() => setShowAddLyricModal(true)} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">
                + Add Lyric
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">No</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Title</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Lyric</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lyrics.map((item, idx) => (
                    <tr key={item.id} className="border-b border-[#f2f2f2] hover:bg-[#f9f9f9]">
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{idx + 1}</td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">{item.title}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        <div className="max-w-[460px] line-clamp-2">{item.lyric}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingLyric(item); setShowEditLyricModal(true); }} className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90">Edit</button>
                          <button onClick={() => handleDeleteLyric(item.id)} className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lyrics.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">No lyrics available. Click "+ Add Lyric" to create one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* JAR OF HAPPINESS TABLE */}
          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">Jar of Happiness Management</h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">Manage daily affirmations shown in Jar of Happiness</p>
              </div>
              <button onClick={() => setShowAddJarModal(true)} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">
                + Add Affirmation
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">No</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Title</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Category</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Content</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jarOfHappiness.map((item, idx) => (
                    <tr key={item.id} className="border-b border-[#f2f2f2] hover:bg-[#f9f9f9]">
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{idx + 1}</td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">{item.title}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{item.category}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        <div className="max-w-[400px] line-clamp-2">{item.content}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingJar(item); setShowEditJarModal(true); }} className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90">Edit</button>
                          <button onClick={() => handleDeleteJar(item.id)} className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {jarOfHappiness.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">No affirmations available. Click "+ Add Affirmation" to create one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FYP QUESTIONS TABLE */}
          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">FYP Question Management</h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">Add, edit, and remove questions shown on Find Your Passion</p>
              </div>
              <button onClick={() => setShowAddQuestionModal(true)} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">
                + Add Question
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">No</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Question</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Category</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((item, idx) => (
                    <tr key={item.id} className="border-b border-[#f2f2f2] hover:bg-[#f9f9f9]">
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{idx + 1}</td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">{item.text}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{getCategoryLabel(item.category)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingQuestion(item); setShowEditQuestionModal(true); }} className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90">Edit</button>
                          <button onClick={() => handleDeleteQuestion(item.id)} className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">No questions available. Click "+ Add Question" to create one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Quick Actions</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={() => setShowAddLyricModal(true)} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">+ Add Lyric</p>
                  <p className="mt-1 text-[12px] text-[#666]">Create a new lyric entry</p>
                </button>
                <button onClick={() => setShowAddJarModal(true)} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">+ Add Affirmation</p>
                  <p className="mt-1 text-[12px] text-[#666]">Create a new daily affirmation</p>
                </button>
                <button onClick={() => setShowAddQuestionModal(true)} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">+ Add Question</p>
                  <p className="mt-1 text-[12px] text-[#666]">Create a new FYP question</p>
                </button>
                <button onClick={handleResetToDefault} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Reset to Default</p>
                  <p className="mt-1 text-[12px] text-[#666]">Restore default content</p>
                </button>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Content Insights</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Latest Lyric</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">{lyrics[0]?.title || "-"}</p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Latest Affirmation</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">{jarOfHappiness[0]?.title || "-"}</p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Total Questions</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">{questions.length} questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADD LYRIC MODAL */}
      {showAddLyricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Add New Lyric</h2>
                <p className="mt-1 text-[14px] text-[#777]">Fill in the lyric title and text below</p>
              </div>
              <button onClick={() => setShowAddLyricModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleAddLyric} className="space-y-4">
              <input type="text" placeholder="Song title" value={lyricForm.title} onChange={(e) => setLyricForm({ ...lyricForm, title: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <textarea placeholder="Write the lyric text here..." value={lyricForm.lyric} onChange={(e) => setLyricForm({ ...lyricForm, lyric: e.target.value })} rows={6} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddLyricModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Lyric</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LYRIC MODAL */}
      {showEditLyricModal && editingLyric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Lyric</h2>
                <p className="mt-1 text-[14px] text-[#777]">Update the selected lyric</p>
              </div>
              <button onClick={() => { setShowEditLyricModal(false); setEditingLyric(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleUpdateLyric} className="space-y-4">
              <input type="text" value={editingLyric.title} onChange={(e) => setEditingLyric({ ...editingLyric, title: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <textarea value={editingLyric.lyric} onChange={(e) => setEditingLyric({ ...editingLyric, lyric: e.target.value })} rows={6} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowEditLyricModal(false); setEditingLyric(null); }} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD JAR MODAL */}
      {showAddJarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Add Jar of Happiness Item</h2>
                <p className="mt-1 text-[14px] text-[#777]">Add a new daily affirmation for users to discover</p>
              </div>
              <button onClick={() => setShowAddJarModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleAddJar} className="space-y-4">
              <input type="text" placeholder="Affirmation title (e.g., Gentle Growth)" value={jarForm.title} onChange={(e) => setJarForm({ ...jarForm, title: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <select value={jarForm.category} onChange={(e) => setJarForm({ ...jarForm, category: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20">
                {jarOfHappinessCategories.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
              </select>
              <textarea placeholder="Write the affirmation message here..." value={jarForm.content} onChange={(e) => setJarForm({ ...jarForm, content: e.target.value })} rows={6} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddJarModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JAR MODAL */}
      {showEditJarModal && editingJar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Jar of Happiness Item</h2>
                <p className="mt-1 text-[14px] text-[#777]">Update the daily affirmation</p>
              </div>
              <button onClick={() => { setShowEditJarModal(false); setEditingJar(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleUpdateJar} className="space-y-4">
              <input type="text" value={editingJar.title} onChange={(e) => setEditingJar({ ...editingJar, title: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <select value={editingJar.category} onChange={(e) => setEditingJar({ ...editingJar, category: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20">
                {jarOfHappinessCategories.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
              </select>
              <textarea value={editingJar.content} onChange={(e) => setEditingJar({ ...editingJar, content: e.target.value })} rows={6} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowEditJarModal(false); setEditingJar(null); }} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Add New FYP Question</h2>
                <p className="mt-1 text-[14px] text-[#777]">Write the question and choose its category</p>
              </div>
              <button onClick={() => setShowAddQuestionModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <textarea placeholder="Write the FYP question here..." value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} rows={5} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <select value={questionForm.category} onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20">
                {categoryOptions.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddQuestionModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {showEditQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit FYP Question</h2>
                <p className="mt-1 text-[14px] text-[#777]">Update the selected FYP question and category</p>
              </div>
              <button onClick={() => { setShowEditQuestionModal(false); setEditingQuestion(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <textarea value={editingQuestion.text} onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })} rows={5} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <select value={editingQuestion.category} onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20">
                {categoryOptions.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowEditQuestionModal(false); setEditingQuestion(null); }} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}