export const lyricsByDay = [
  {
    id: 1,
    title: "Who Knows",
    lyric:
      "You’re Pure, You’re Kind (Let Me Know, Let Me Know, Let Me Know, Let Me) Mature, Divine (Let Me Know, Let Me Know, Let Me Know, Let Me) You Might Be Too Good For Me, Unattainable (Let Me Know, Let Me Know, Let Me)",
  },
  {
    id: 2,
    title: "Home",
    lyric:
      "There is still a place for your heart to rest, even after difficult days.",
  },
  {
    id: 3,
    title: "Blue",
    lyric:
      "I’ll paint the sky in shades of calm and learn to breathe again today.",
  },
  {
    id: 4,
    title: "Saturn",
    lyric:
      "Some things take time to heal, and some answers arrive softly.",
  },
  {
    id: 5,
    title: "Begin Again",
    lyric:
      "Even if the day feels heavy, tomorrow still gives you another page.",
  },
  {
    id: 6,
    title: "Bloom",
    lyric:
      "Little by little, your quiet growth is still becoming something beautiful.",
  },
  {
    id: 7,
    title: "Golden Hour",
    lyric:
      "You deserve gentle moments too, not only survival and endurance.",
  },
];

const LYRICS_STORAGE_KEY = "healinq_admin_lyrics";

export function getStoredLyrics() {
  if (typeof window === "undefined") {
    return lyricsByDay;
  }

  try {
    const storedLyrics = localStorage.getItem(LYRICS_STORAGE_KEY);

    if (!storedLyrics) {
      return lyricsByDay;
    }

    const parsedLyrics = JSON.parse(storedLyrics);

    if (!Array.isArray(parsedLyrics) || parsedLyrics.length === 0) {
      return lyricsByDay;
    }

    const sanitizedLyrics = parsedLyrics.filter(
      (item) =>
        item &&
        typeof item.title === "string" &&
        typeof item.lyric === "string" &&
        item.title.trim() !== "" &&
        item.lyric.trim() !== ""
    );

    return sanitizedLyrics.length > 0 ? sanitizedLyrics : lyricsByDay;
  } catch (error) {
    console.error("Failed to load stored lyrics:", error);
    return lyricsByDay;
  }
}

export function getDailyLyric() {
  const lyricSource = getStoredLyrics();

  if (!Array.isArray(lyricSource) || lyricSource.length === 0) {
    return {
      title: "No Lyric Available",
      lyric: "No lyric has been added yet.",
    };
  }

  const today = new Date();
  const seed =
    today.getFullYear() * 1000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  return lyricSource[seed % lyricSource.length];
}