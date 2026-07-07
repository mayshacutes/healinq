import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ id: null }, { status: 400 });
  }

  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const user = data?.users?.find(u => u.email === email);

  return NextResponse.json({ id: user?.id || null });
}
