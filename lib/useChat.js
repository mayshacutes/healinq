"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useChat(roomId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (!error) setMessages(data || []);
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    fetchMessages();

    channelRef.current = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [roomId, fetchMessages]);

  // Kirim pesan — pakai kolom "message" sesuai schema
  const sendMessage = async (content, senderId) => {
    if (!content.trim() || !roomId) return false;

    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      sender_id: senderId,
      message: content.trim(), // ← pakai "message" bukan "content"
      consultation_id: null,   // boleh null karena sudah ada room_id
    });

    if (error) {
      console.error("Gagal kirim:", error.message);
      return false;
    }
    return true;
  };

  const markAsRead = async (currentUserId) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("room_id", roomId)
      .neq("sender_id", currentUserId)
      .eq("is_read", false);
  };

  return { messages, loading, sendMessage, markAsRead };
}
