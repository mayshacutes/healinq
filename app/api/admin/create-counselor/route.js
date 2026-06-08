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
    } = body;

    console.log("CREATE COUNSELOR BODY:", body);

    // VALIDATION
    if (!full_name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // CREATE AUTH USER
    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        username: email.split("@")[0],
        full_name,
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

    // UPDATE PROFILE (dibuat otomatis oleh trigger handle_new_user)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name,
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
        name: full_name,
        email: email.trim().toLowerCase(),
        specialty,
        specialization: specialty,
        address,
        location: address,
        status,
        sessions,
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