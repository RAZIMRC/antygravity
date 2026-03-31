import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { message, stack, url, context } = await req.json();

    // Attempt to get user ID for context
    let userId: string | null = null;
    try {
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.split(" ")[1];
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }
    } catch (authErr) {
      // Ignore auth fetch errors
    }

    // Log to Supabase error_logs table
    const { error: logErr } = await supabaseAdmin.from("error_logs").insert({
      user_id: userId,
      message: message || "Frontend Error",
      stack: stack,
      url: url,
      method: 'CLIENT',
      context: {
        ...context,
        userAgent: req.headers.get('user-agent'),
      }
    });

    if (logErr) throw logErr;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SEMS Global Logger Error:", err);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}
