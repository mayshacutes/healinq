import { NextResponse } from "next/server";

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

    const decoded = Buffer.from(
      cookie.value,
      "base64url"
    ).toString("utf-8");

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