import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password, role, displayName } = await req.json();

    // 1. Verify the requester is an admin
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminUser.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // 2. Create the user via Supabase Admin Auth
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        role: role || 'employee',
        display_name: displayName || email.split('@')[0]
      }
    });

    if (createError) throw createError;

    // 3. Ensure the profile is explicitly updated (trigger should handle it, but better safe)
    if (data.user) {
      await supabaseAdmin
        .from("profiles")
        .update({ role: role || 'employee', display_name: displayName || email.split('@')[0] })
        .eq("id", data.user.id);
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
