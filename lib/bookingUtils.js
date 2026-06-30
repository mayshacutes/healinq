export const BOOKING_STATUS = {
  NOT_STARTED: "not_started",
  ACTIVE: "active",
  EXPIRED: "expired",
};

// consultation_date = "2026-05-30", consultation_hour = "08:00"
// session_duration dalam menit (default 60)
export function getBookingStatus(consultationDate, consultationHour, sessionDuration = 60) {
  const now = new Date();

  // Gabungkan date + hour jadi satu datetime
  const start = new Date(`${consultationDate}T${consultationHour}:00+07:00`); // WIB
  const end = new Date(start.getTime() + sessionDuration * 60 * 1000);

  if (now < start) return BOOKING_STATUS.NOT_STARTED;
  if (now >= start && now <= end) return BOOKING_STATUS.ACTIVE;
  return BOOKING_STATUS.EXPIRED;
}

// Countdown "Starts in 16j 42m 31s"
export function getCountdown(consultationDate, consultationHour) {
  const now = new Date();
  const start = new Date(`${consultationDate}T${consultationHour}:00+07:00`);
  const diff = start - now;

  if (diff <= 0) return null;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `Starts in ${h}j ${m}m ${s}s`;
}

// Format "2026-05-30 • 08.00 WIB"
export function formatSchedule(consultationDate, consultationHour) {
  const hour = consultationHour?.slice(0, 5).replace(":", "."); // "08:00" → "08.00"
  return `${consultationDate} • ${hour} WIB`;
}