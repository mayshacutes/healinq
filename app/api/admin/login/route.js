import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase URL atau Service Role Key belum ada di .env.local");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Username/email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const cleanIdentifier = identifier.trim();

    let admin = null;

    // Cek berdasarkan email dulu
    const { data: adminByEmail, error: emailError } = await supabaseAdmin
      .from("admin")
      .select("admin_id, name, email, password_hash, status")
      .eq("email", cleanIdentifier)
      .maybeSingle();

    if (emailError) {
      return NextResponse.json(
        { success: false, message: emailError.message },
        { status: 500 }
      );
    }

    admin = adminByEmail;

    // Kalau tidak ketemu dari email, cek berdasarkan name
    if (!admin) {
      const { data: adminByName, error: nameError } = await supabaseAdmin
        .from("admin")
        .select("admin_id, name, email, password_hash, status")
        .eq("name", cleanIdentifier)
        .maybeSingle();

      if (nameError) {
        return NextResponse.json(
          { success: false, message: nameError.message },
          { status: 500 }
        );
      }

      admin = adminByName;
    }

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin tidak ditemukan." },
        { status: 401 }
      );
    }

    if (admin.status && admin.status.toLowerCase() !== "active") {
      return NextResponse.json(
        { success: false, message: "Akun admin tidak aktif." },
        { status: 403 }
      );
    }

    const isPasswordValid = admin.password_hash.startsWith("$2")
      ? bcrypt.compareSync(password, admin.password_hash)
      : password === admin.password_hash;

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Password admin salah." },
        { status: 401 }
      );
    }

    // Jika password masih plain text, hash dan simpan ke database
    if (!admin.password_hash.startsWith("$2")) {
      const hashedPassword = bcrypt.hashSync(admin.password_hash, 10);
      await supabaseAdmin
        .from("admin")
        .update({ password_hash: hashedPassword, updated_at: new Date() })
        .eq("admin_id", admin.admin_id);
    }

    const adminSession = {
      admin_id: admin.admin_id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    };

    const response = NextResponse.json({
      success: true,
      message: "Login admin berhasil.",
      admin: adminSession,
    });

    const cookieValue = Buffer.from(JSON.stringify(adminSession)).toString(
      "base64url"
    );

    response.cookies.set("healinq_admin", cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan saat login admin.",
      },
      { status: 500 }
    );
  }
}