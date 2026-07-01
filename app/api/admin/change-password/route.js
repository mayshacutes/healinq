import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    const cookie = request.cookies.get("healinq_admin");

    if (!cookie?.value) {
      return NextResponse.json(
        { success: false, message: "Admin belum login" },
        { status: 401 }
      );
    }

    const adminData = JSON.parse(
      Buffer.from(cookie.value, "base64url").toString()
    );

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: admin, error } = await supabase
      .from("admin")
      .select("*")
      .eq("admin_id", adminData.admin_id)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { success: false, message: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    // sementara plain text sesuai login admin kamu sekarang
    if (admin.password_hash !== currentPassword) {
      return NextResponse.json(
        { success: false, message: "Password lama salah" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("admin")
      .update({
        password_hash: newPassword,
        updated_at: new Date(),
      })
      .eq("admin_id", admin.admin_id);

    if (updateError) throw updateError;

    await supabase.from("activity_logs").insert([
      {
        actor_name: admin.name,
        actor_role: "Admin",
        action: "Changed password",
        category: "Security",
        status: "Completed",
        description: "Admin changed account password",
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}