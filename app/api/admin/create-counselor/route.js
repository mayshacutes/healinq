import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      full_name,
      email,
      password,
      specialty,
      address,
      status,
      sessions,
      str_number,
    } = body;

    console.log("CREATE COUNSELOR BODY:", body);

    const cleanFullName = full_name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password;
    const cleanUsername = cleanEmail?.split("@")[0]?.trim();

    // VALIDATION
    if (!cleanFullName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email tidak valid.",
        },
        { status: 400 }
      );
    }

    // CEK USERNAME DUPLICATE DI PROFILES
    const { data: existingUsername, error: usernameCheckError } =
      await supabaseAdmin
        .from("profiles")
        .select("id, username, role")
        .ilike("username", cleanUsername)
        .maybeSingle();

    if (usernameCheckError) {
      console.error("USERNAME CHECK ERROR:", usernameCheckError);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengecek username.",
        },
        { status: 400 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message: `Username "${cleanUsername}" sudah digunakan. Gunakan email lain atau ubah username akun yang sudah ada.`,
        },
        { status: 400 }
      );
    }

    // CREATE AUTH USER
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          username: cleanUsername,
          full_name: cleanFullName,
          role: "counselor",
        },
      });

    console.log("AUTH DATA:", authData);
    console.log("AUTH ERROR:", authError);

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          message: authError.message,
          error: authError,
        },
        { status: 400 }
      );
    }

    const authId = authData.user.id;

    console.log("AUTH ID:", authId);

    // UPDATE PROFILE
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        username: cleanUsername,
        full_name: cleanFullName,
        email: cleanEmail,
        role: "counselor",
        status,
        specialty,
        address,
        sessions,
      })
      .eq("id", authId);

    console.log("PROFILE ERROR:", profileError);

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          message: profileError.message,
        },
        { status: 400 }
      );
    }

    // INSERT COUNSELOR
    const { error: counselorError } = await supabaseAdmin
      .from("counselors")
      .insert({
        id: authId,
        name: cleanFullName,
        email: cleanEmail,
        specialty,
        specialization: specialty,
        address,
        location: address,
        status,
        sessions,
        str_number,
      });

    console.log("COUNSELOR ERROR:", counselorError);

    if (counselorError) {
      return NextResponse.json(
        {
          success: false,
          message: counselorError.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Counselor created successfully.",
      counselorId: authId,
    });
  } catch (error) {
    console.error("CREATE COUNSELOR ERROR:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}