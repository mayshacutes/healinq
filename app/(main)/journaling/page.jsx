"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { logActivity } from "@/lib/activityLogger";
import { supabase } from "@/lib/supabaseClient";

const moodOptions = [
  { id: "awful", emoji: "😞", label: "Awful" },
  { id: "sad", emoji: "😟", label: "Sad" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "great", emoji: "😄", label: "Great" },
];

const ballColors = [
  "bg-[#f7a8d4]",
  "bg-[#8bd9d2]",
  "bg-[#9bd7f5]",
  "bg-[#f4b6d9]",
  "bg-[#7fd0c7]",
  "bg-[#a9ddf7]",
];

function formatCardDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
}

function getDateGroupLabel(dateString) {
  const entryDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const entryOnly = new Date(
    entryDate.getFullYear(),
    entryDate.getMonth(),
    entryDate.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (entryOnly.getTime() === todayOnly.getTime()) return "Today";
  if (entryOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(entryDate);
}

export default function JournalingPage() {
  const searchParams = useSearchParams();

  const hasHandledJarQuery = useRef(false);
  const hasHandledNewQuery = useRef(false);

  const [entries, setEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [jarOpen, setJarOpen] = useState(false);
  const [jarMessage, setJarMessage] = useState("");
  const [jarColor, setJarColor] = useState(ballColors[0]);
  const [loading, setLoading] = useState(true);
  const [jarItems, setJarItems] = useState([]);

  // Edit mode states
  const [editingEntry, setEditingEntry] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Ambil user session dan load data
  useEffect(() => {
    const loadUserAndData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setCurrentUser(profile);

          // Load journal entries dari Supabase
          await loadJournalEntries(user.id);

          // Load mood hari ini
          const today = new Date().toISOString().split('T')[0];
          const { data: moodData } = await supabase
            .from("user_moods")
            .select("mood")
            .eq("user_id", user.id)
            .eq("date", today)
            .single();

          if (moodData) {
            setSelectedMood(moodData.mood);
          }
        }

        // Load Jar of Happiness items dari Supabase
        const { data: jarData, error: jarError } = await supabase
          .from("jar_of_happiness")
          .select("*");

        if (!jarError && jarData && jarData.length > 0) {
          setJarItems(jarData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, []);

  // Function to load journal entries
  const loadJournalEntries = async (userId) => {
    const { data: journalData, error: journalError } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!journalError && journalData) {
      setEntries(journalData);
    }
  };

  useEffect(() => {
    const openNew = searchParams.get("new");
    const openJar = searchParams.get("jar");

    if (openNew === "true" && !hasHandledNewQuery.current) {
      hasHandledNewQuery.current = true;
      setShowEntryForm(true);
    }

    if (openJar === "true" && !hasHandledJarQuery.current) {
      hasHandledJarQuery.current = true;
      handleJarClick();
    }
  }, [searchParams]);

  const groupedEntries = useMemo(() => {
    const groups = {};
    entries.forEach((entry) => {
      const label = getDateGroupLabel(entry.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    });
    return groups;
  }, [entries]);

  const handleMoodClick = async (moodId) => {
    setSelectedMood(moodId);

    if (currentUser?.id) {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from("user_moods")
        .upsert({
          user_id: currentUser.id,
          date: today,
          mood: moodId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error("Error saving mood:", error);
      }

      await logActivity({
        actor_id: currentUser.id,

        actor_name:
          currentUser.username ||
          currentUser.email,

        actor_role: "User",

        action: "Updated mood tracker",

        category: "Self-Healing",

        status: "Completed",

        description: `Selected mood: ${moodId}`,
      });
    }
  };

  const handleSaveEntry = async () => {
    if (!content.trim()) return;

    if (!currentUser?.id) {
      alert("Please login to save journal entries");
      return;
    }

    const newEntry = {
      user_id: currentUser.id,
      title: title.trim() || null,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("journal_entries")
      .insert([newEntry])
      .select();

    if (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry");
      return;
    }

    setEntries([data[0], ...entries]);
    setTitle("");
    setContent("");
    setShowEntryForm(false);

    await logActivity({
      actor_id: currentUser.id,

      actor_name:
        currentUser.username ||
        currentUser.email,

      actor_role: "User",

      action: "Created journal entry",

      category: "Self-Healing",

      status: "Completed",

      description:
        title.trim()
          ? `Created journal: ${title}`
          : "Created a journal entry",
    });
  };

  // ========== EDIT ENTRY ==========
  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setEditTitle(entry.title || "");
    setEditContent(entry.content);
  };

  const handleUpdateEntry = async () => {
    if (!editContent.trim()) {
      alert("Content cannot be empty");
      return;
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .update({
        title: editTitle.trim() || null,
        content: editContent.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", editingEntry.id)
      .select();

    if (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry");
      return;
    }

    // Update entries list
    setEntries(entries.map(entry =>
      entry.id === editingEntry.id ? data[0] : entry
    ));

    setEditingEntry(null);
    setEditTitle("");
    setEditContent("");

    await logActivity({
      actor_id: currentUser.id,

      actor_name:
        currentUser.username ||
        currentUser.email,

      actor_role: "User",

      action: "Updated journal entry",

      category: "Self-Healing",

      status: "Completed",

      description:
        editTitle.trim()
          ? `Updated journal: ${editTitle}`
          : "Updated a journal entry",
    });
  };

  // ========== DELETE ENTRY ==========
  const handleDeleteEntry = async (entryId) => {
    const confirmed = window.confirm("Are you sure you want to delete this journal entry?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
      return;
    }

    setEntries(entries.filter(entry => entry.id !== entryId));

    await logActivity({
      actor_id: currentUser.id,

      actor_name:
        currentUser.username ||
        currentUser.email,

      actor_role: "User",

      action: "Deleted journal entry",

      category: "Self-Healing",

      status: "Completed",

      description:
        "User deleted a journal entry.",
    });
  };

  const handleJarClick = () => {
    if (jarItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * jarItems.length);
      const randomItem = jarItems[randomIndex];
      const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];

      setJarMessage(randomItem.content);
      setJarColor(randomColor);
      setJarOpen(true);
    } else {
      const fallbackMessages = [
        "You are allowed to grow slowly. Small progress is still progress.",
        "Take a deep breath. You do not have to solve everything today.",
        "Rest is not laziness. Rest is part of healing.",
        "You are still worthy, even on low-energy days.",
        "One gentle step is enough for today.",
      ];
      const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];
      setJarMessage(randomMessage);
      setJarColor(randomColor);
      setJarOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d9edf8]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent"></div>
          <p className="text-[#e1268d]">Loading...</p>
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
      </div>

      <div className="absolute left-0 top-0 z-0 h-[180px] w-full overflow-hidden sm:h-[220px]">
        <Image
          src="/images/header.png"
          alt="Header"
          fill
          className="object-cover"
          priority
        />
      </div>

      <section className="relative z-10 w-full px-5 pb-6 pt-[150px] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative rounded-[28px] px-5 py-6 sm:px-7 lg:px-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-[-70px] top-[28%] h-52 w-52 rounded-full bg-[#8dd8d1]/30 blur-[80px]" />
              <div className="absolute right-[8%] top-[70%] h-52 w-52 rounded-full bg-[#f6bfdc]/40 blur-[90px]" />
              <div className="absolute right-[20%] top-[10%] h-44 w-44 rounded-full bg-[#9dd8f5]/35 blur-[80px]" />
            </div>

            <div className="relative z-10">
              <div className="mb-8 flex justify-end -mt-20">
                <div className="flex items-center gap-4 rounded-full bg-[#8fd0ef] px-4 py-3 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#79bde4] bg-[#dff4ff] text-[12px] font-semibold text-[#74a4d4]">
                      XP
                    </div>
                    <span className="text-[18px] font-bold text-white">
                      {currentUser?.exp?.toLocaleString() || "0"}
                    </span>
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

              <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-[34px] font-bold leading-none text-[#0c72a6] sm:text-[42px]">
                    Daily Journaling
                  </h1>
                  <p className="mt-2 text-[18px] italic text-[#2086c4]">
                    Where thoughts find their words
                  </p>
                </div>
              </div>

              {/* Mood Tracker */}
              <div className="mb-12 rounded-[18px] bg-white/90 px-4 py-4 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="text-[18px] font-medium text-[#272727]">
                    Track Your Mood Today
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {moodOptions.map((mood) => {
                      const isActive = selectedMood === mood.id;

                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => handleMoodClick(mood.id)}
                          className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition ${isActive
                            ? "scale-110 border-[#0c72a6] bg-[#d9edf8] shadow-md"
                            : "border-[#ececec] bg-[#f8f8f8] hover:scale-105"
                            }`}
                          title={mood.label}
                        >
                          {mood.emoji}
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden h-9 w-px bg-[#d9d9d9] lg:block" />

                  <p className="text-[16px] italic text-[#444]">
                    {selectedMood
                      ? `Today's mood saved: ${moodOptions.find((m) => m.id === selectedMood)?.label}`
                      : "Tell me how do you feel today..."}
                  </p>
                </div>
              </div>

              {/* Journal Entries */}
              <div className="mb-8 flex items-center justify-between gap-3">
                <h2 className="text-[30px] font-bold text-[#0c72a6]">
                  Journaling Notes
                </h2>

                <button
                  type="button"
                  onClick={() => setShowEntryForm((prev) => !prev)}
                  className="rounded-full bg-[#0c72a6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0a5f8a]"
                >
                  + New Entry
                </button>
              </div>

              {/* Add New Entry Form */}
              {showEntryForm && (
                <div className="mb-8 rounded-[20px] bg-white/95 p-5 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-[46px] rounded-[14px] border border-[#d8d8d8] px-4 text-[14px] text-[#2c2c2c] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20"
                    />

                    <textarea
                      placeholder="Write your thoughts here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                      className="rounded-[14px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#2c2c2c] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20"
                    />

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleSaveEntry}
                        className="rounded-full bg-[#0c72a6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0a5f8a]"
                      >
                        Save Note
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowEntryForm(false);
                          setTitle("");
                          setContent("");
                        }}
                        className="rounded-full border border-[#bdbdbd] bg-white px-5 py-2 text-sm font-medium text-[#4a4a4a] transition hover:bg-[#f7f7f7]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Entry Modal */}
              {editingEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-lg">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Journal Entry</h2>
                        <p className="mt-1 text-[14px] text-[#777]">Update your thoughts</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingEntry(null);
                          setEditTitle("");
                          setEditContent("");
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] hover:bg-[#efefef]"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      <input
                        type="text"
                        placeholder="Title (optional)"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-[46px] rounded-[14px] border border-[#d8d8d8] px-4 text-[14px] text-[#2c2c2c] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20"
                      />

                      <textarea
                        placeholder="Write your thoughts here..."
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                        className="rounded-[14px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#2c2c2c] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20"
                      />

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(null);
                            setEditTitle("");
                            setEditContent("");
                          }}
                          className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateEntry}
                          className="rounded-full bg-[#0c72a6] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0a5f8a]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Journal Entries List */}
              <div className="space-y-8">
                {Object.keys(groupedEntries).length === 0 ? (
                  <div className="text-center py-10 bg-white/80 rounded-2xl">
                    <p className="text-gray-500">No journal entries yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "+ New Entry" to start writing!</p>
                  </div>
                ) : (
                  Object.keys(groupedEntries).map((groupLabel) => (
                    <div key={groupLabel}>
                      <h3 className="mb-4 text-[22px] font-semibold text-[#1f1f1f]">
                        {groupLabel}
                      </h3>

                      <div className="space-y-5">
                        {groupedEntries[groupLabel].map((entry) => (
                          <div
                            key={entry.id}
                            className="overflow-hidden rounded-[18px] bg-white/95 shadow-[0_4px_18px_rgba(0,0,0,0.08)] transition hover:shadow-md"
                          >
                            <div className="px-5 py-5">
                              {entry.title ? (
                                <h4 className="mb-1 text-[18px] font-semibold text-[#1f1f1f]">
                                  {entry.title}
                                </h4>
                              ) : null}

                              <p className="text-[16px] leading-7 text-[#2e2e2e]">
                                {entry.content}
                              </p>
                            </div>

                            <div className="border-t border-[#ececec] px-5 py-3 flex justify-between items-center">
                              <span className="text-sm text-[#b0b0b0]">
                                {formatCardDate(entry.created_at)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(entry)}
                                  className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Jar of Happiness */}
              <div className="mt-14">
                <h2 className="text-[34px] font-bold leading-none text-[#0c72a6]">
                  Jar of Happiness
                </h2>
                <p className="mt-2 text-[18px] italic text-[#2086c4]">
                  Pick one to brighten up your day
                </p>

                <div className="mt-6 rounded-[22px] bg-white/95 px-4 py-6 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:px-8">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleJarClick}
                      className="mb-2 text-[36px] leading-none text-black transition hover:rotate-90"
                      title="Shuffle affirmation"
                    >
                      ↻
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleJarClick}
                    className="mx-auto block transition hover:scale-[1.02]"
                  >
                    <Image
                      src="/images/jar.png"
                      alt="Jar of Happiness"
                      width={380}
                      height={420}
                      className="h-auto w-[240px] sm:w-[300px] lg:w-[360px]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jar Modal */}
      {jarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="relative flex h-[320px] w-[320px] items-center justify-center">
            <button
              type="button"
              onClick={() => setJarOpen(false)}
              className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#444] shadow-md hover:bg-[#f7f7f7]"
            >
              ×
            </button>

            <div
              className={`flex h-[280px] w-[280px] items-center justify-center rounded-full ${jarColor} p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
            >
              <p className="text-[18px] font-medium leading-8 text-white">
                {jarMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}