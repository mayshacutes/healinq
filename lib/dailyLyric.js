export const lyricsByDay = [
  {
    title: "Who Knows",
    lyric:
      "You’re Pure, You’re Kind (Let Me Know, Let Me Know, Let Me Know, Let Me) Mature, Divine (Let Me Know, Let Me Know, Let Me Know, Let Me) You Might Be Too Good For Me, Unattainable (Let Me Know, Let Me Know, Let Me)",
  },
  {
    title: "Home",
    lyric:
      "There is still a place for your heart to rest, even after difficult days.",
  },
  {
    title: "Blue",
    lyric:
      "I’ll paint the sky in shades of calm and learn to breathe again today.",
  },
  {
    title: "Saturn",
    lyric:
      "Some things take time to heal, and some answers arrive softly.",
  },
  {
    title: "Begin Again",
    lyric:
      "Even if the day feels heavy, tomorrow still gives you another page.",
  },
  {
    title: "Bloom",
    lyric:
      "Little by little, your quiet growth is still becoming something beautiful.",
  },
  {
    title: "Golden Hour",
    lyric:
      "You deserve gentle moments too, not only survival and endurance.",
  },
];

export function getDailyLyric() {
  const today = new Date();
  const seed =
    today.getFullYear() * 1000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  return lyricsByDay[seed % lyricsByDay.length];
}