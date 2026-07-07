import { NextResponse } from "next/server";
import { verifyCookie } from "@/lib/adminCookie";

export async function GET(request) {
  try {
    const cookie = request.cookies.get("healinq_admin");

    if (!cookie) {
      return NextResponse.json(
        {
          success: false,
          message: "No admin cookie found",
        },
        { status: 401 }
      );
    }

    const verified = await verifyCookie(cookie.value);
    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin session",
        },
        { status: 401 }
      );
    }

    const decoded = Buffer.from(verified, "base64url").toString("utf-8");
    const admin = JSON.parse(decoded);

    return NextResponse.json({
      success: true,
      admin,
    });

  } catch (error) {
    console.error("ADMIN ME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}