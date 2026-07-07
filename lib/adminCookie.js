const encoder = new TextEncoder();

function getSecret() {
  if (typeof process === "undefined" || !process.env) return null;
  const secret = process.env.ADMIN_COOKIE_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return encoder.encode(secret);
  return null;
}

async function getKey(secretBytes) {
  return await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signCookie(value) {
  const sec = getSecret();
  if (!sec) return value;
  const key = await getKey(sec);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${value}.${sigB64}`;
}

export async function verifyCookie(value) {
  const sec = getSecret();
  if (!sec) return value;
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = value.slice(0, lastDot);
  const sigB64 = value.slice(lastDot + 1);
  const key = await getKey(sec);
  try {
    const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, sig, encoder.encode(payload));
    return ok ? payload : null;
  } catch {
    return null;
  }
}
