import { createClient } from '@supabase/supabase-js';

function createLazyClient(getUrl, getKey, options) {
  let instance;
  const handler = {
    get(_, prop) {
      if (!instance) {
        const url = getUrl();
        const key = getKey();
        if (!url) throw new Error("supabaseUrl is required");
        if (!key) throw new Error("supabase key is required");
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
    }
  }
);

export const supabaseAdmin = createLazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_URL,
  () => process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);
