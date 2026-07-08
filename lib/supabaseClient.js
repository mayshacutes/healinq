import { createClient } from "@supabase/supabase-js";

function createLazyClient(getUrl, getKey, options) {
  let instance;
  const handler = {
    get(_, prop) {
      if (!instance) {
        const url = getUrl();
        const key = getKey();
        if (!url || !key) {
          throw new Error("Supabase URL atau Anon Key belum ada di .env.local");
        }
        instance = createClient(url, key, options);
      }
      return instance[prop];
    }
  };
  return new Proxy({}, handler);
}

export const supabase = createLazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_URL,
  () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  }
);
