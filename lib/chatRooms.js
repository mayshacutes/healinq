import { supabase } from "./supabaseClient";

// Buat room saat consultation dibuat
export async function createRoomForConsultation(consultationId, userId, counselorId) {
  const { data, error } = await supabase
    .from("chat_rooms")
    .insert({
      consultation_id: consultationId,
      user_id: userId,
      counselor_id: counselorId,
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal buat room:", error.message);
    return null;
  }
  return data;
}

// Ambil room berdasarkan consultation_id
export async function getRoomByConsultationId(consultationId) {
  const { data, error } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("consultation_id", consultationId)
    .maybeSingle();

  if (error) return null;
  return data;
}

// Ambil semua consultation milik user (untuk sidebar)
export async function getUserConsultations(userId) {
  const { data, error } = await supabase
    .from("consultations")
    .select(`
      id,
      booking_code,
      consultation_date,
      consultation_hour,
      consultation_type,
      status,
      session_duration,
      counselor_name,
      counselor_id,
      chat_rooms (id)
    `)
    .eq("client_id", userId)
    .order("consultation_date", { ascending: false });

  if (error) return [];
  return data;
}

// Ambil semua consultation milik counselor (untuk sidebar counselor)
export async function getCounselorConsultations(counselorId) {
  const { data, error } = await supabase
    .from("consultations")
    .select(`
      id,
      booking_code,
      consultation_date,
      consultation_hour,
      consultation_type,
      status,
      session_duration,
      client_name,
      client_id,
      chat_rooms (id)
    `)
    .eq("counselor_id", counselorId)
    .order("consultation_date", { ascending: false });

  if (error) return [];
  return data;
}
