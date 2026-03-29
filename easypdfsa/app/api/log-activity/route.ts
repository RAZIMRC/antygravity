import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, originalFilename, exportFilename, deviceType } = await req.json();

    const { error } = await supabaseAdmin
      .from("activity_logs")
      .insert({
        username,
        original_filename: originalFilename,
        export_filename: exportFilename,
        device_type: deviceType
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Activity logging error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
