import { supabase } from './supabaseClient';

// ========== LYRICS ==========
export const lyricAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('lyrics')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (title, lyric) => {
    const { data, error } = await supabase
      .from('lyrics')
      .insert([{ title, lyric }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, title, lyric) => {
    const { data, error } = await supabase
      .from('lyrics')
      .update({ title, lyric, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('lyrics')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ========== JAR OF HAPPINESS ==========
export const jarAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('jar_of_happiness')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (title, content, category) => {
    const { data, error } = await supabase
      .from('jar_of_happiness')
      .insert([{ title, content, category }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, title, content, category) => {
    const { data, error } = await supabase
      .from('jar_of_happiness')
      .update({ title, content, category, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('jar_of_happiness')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ========== FYP QUESTIONS ==========
export const questionAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('fyp_questions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (text, category) => {
    const { data, error } = await supabase
      .from('fyp_questions')
      .insert([{ text, category }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, text, category) => {
    const { data, error } = await supabase
      .from('fyp_questions')
      .update({ text, category, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('fyp_questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ========== SEED DEFAULT DATA ==========
export const seedDefaultData = async () => {
  // Default lyrics
  const defaultLyrics = [
    { title: "You Are Enough", lyric: "You don't have to be perfect to be worthy." },
    { title: "Let It Be", lyric: "When the night is cloudy, there is still a light that shines on me." },
    // ... tambahkan default lyrics lainnya
  ];

  // Default jar of happiness
  const defaultJar = [
    { title: "Gentle Growth", content: "You are allowed to grow slowly.", category: "Self-Compassion & Healing" },
    // ... tambahkan lainnya
  ];

  // Default questions
  const defaultQuestions = [
    { text: "Seberapa sering Anda menikmati memecahkan teka-teki?", category: "analytical" },
    // ... tambahkan lainnya
  ];

  // Cek apakah data kosong, jika iya insert default
  const { count: lyricCount } = await supabase.from('lyrics').select('*', { count: 'exact', head: true });
  if (lyricCount === 0) {
    for (const lyric of defaultLyrics) {
      await supabase.from('lyrics').insert([lyric]);
    }
  }

  const { count: jarCount } = await supabase.from('jar_of_happiness').select('*', { count: 'exact', head: true });
  if (jarCount === 0) {
    for (const item of defaultJar) {
      await supabase.from('jar_of_happiness').insert([item]);
    }
  }

  const { count: questionCount } = await supabase.from('fyp_questions').select('*', { count: 'exact', head: true });
  if (questionCount === 0) {
    for (const q of defaultQuestions) {
      await supabase.from('fyp_questions').insert([q]);
    }
  }
};