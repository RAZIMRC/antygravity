import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, email, role, displayName, password } = await req.json();

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

    // 2. Update Auth (Email and/or Password)
    const updateAttrs: any = {};
    if (email) updateAttrs.email = email;
    if (password) updateAttrs.password = password;

    if (Object.keys(updateAttrs).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateAttrs);
      if (authError) throw authError;
    }

    // 3. Update Profile Table (Role and/or Display Name)
    const updateProfile: any = {};
    if (role) updateProfile.role = role;
    if (displayName) updateProfile.display_name = displayName;
    if (email) updateProfile.email = email; // Keep profile email in sync

    if (Object.keys(updateProfile).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(updateProfile)
        .eq("id", userId);
      
      if (profileError) throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
