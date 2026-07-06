import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const consultationId = formData.get("consultationId");

    if (!file || !consultationId) {
      return NextResponse.json(
        { error: "File dan consultationId wajib diisi" },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `proof/${consultationId}_${Date.now()}_${sanitizedName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("payment-proofs")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload storage via admin gagal:", uploadError.message);
      return NextResponse.json(
        { error: `Gagal upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("payment-proofs")
      .getPublicUrl(filePath);

    const proofUrl = urlData?.publicUrl || null;

    const { error: updateError } = await supabaseAdmin
      .from("consultations")
      .update({
        proof_uploaded: true,
        proof_file_name: file.name,
        proof_file_url: proofUrl,
        proof_uploaded_at: new Date().toISOString(),
      })
      .eq("id", consultationId);

    if (updateError) {
      console.error("Update consultation gagal:", updateError.message);
    }

    return NextResponse.json({
      success: true,
      proofUrl,
      proofFileName: file.name,
    });
  } catch (err) {
    console.error("Upload API unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
