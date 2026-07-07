import { supabase } from "@/lib/supabaseClient";

function getTodayLyricIndex(totalLyrics) {
  const today = new Date();

  const seed =
    today.getFullYear() * 1000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  return seed % totalLyrics;
}

export async function getDailyLyric() {
  try {
    const { data, error } = await supabase
      .from("lyrics")
      .select("id, title, lyric, created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        title: "No Lyric Available",
        lyric: "No lyric has been added yet.",
      };
    }

    const index = getTodayLyricIndex(data.length);
    return data[index];
  } catch (error) {
    console.error("Failed to fetch daily lyric:", error);

    return {
      title: "No Lyric Available",
      lyric: "Failed to load lyric from database.",
    };
  }
}