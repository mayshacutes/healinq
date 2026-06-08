import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const cookie = request.cookies.get("healinq_admin");

    if (cookie?.value) {
      try {
        const adminData = JSON.parse(
          Buffer.from(cookie.value, "base64url").toString()
        );

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        await supabase.from("activity_logs").insert([
          {
            actor_name: adminData.name,
            actor_role: "Admin",
            action: "Logged out",
            category: "Authentication",
            status: "Completed",
            description: "Admin logged out from the system",
          },
        ]);
      } catch (e) {
        console.error("Failed logging logout activity:", e);
      }
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("healinq_admin", "", {
      path: "/",
      maxAge: 0,
    });

    return response;
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