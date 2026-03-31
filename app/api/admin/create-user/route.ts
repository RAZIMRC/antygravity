import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";
import { apiWrapper } from "@/lib/api-wrapper";

export const POST = apiWrapper(async (req: Request) => {
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

  if (createError) {
    // Custom handling for validation errors
    let message = createError.message || "An unexpected error occurred";
    if (message.includes("User already exists") || createError.status === 422) {
      message = "This email is already registered. Please use a different email.";
    } else if (message.includes("weak_password")) {
      message = "Password is too weak. Use a stronger password.";
    }
    return NextResponse.json({ error: message }, { status: createError.status || 400 });
  }

  // 3. Update profile if user creation succeeded
  if (data.user) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        role: role || 'employee', 
        display_name: displayName || email.split('@')[0] 
      })
      .eq("id", data.user.id);
      
    if (profileError) {
      console.warn("Profile update warning:", profileError.message);
      // We could also throw here to trigger SEMS log
    }
  }

  return NextResponse.json({ success: true, user: data.user });
});
