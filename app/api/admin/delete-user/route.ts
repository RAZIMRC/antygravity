import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";
import { apiWrapper } from "@/lib/api-wrapper";

export const POST = apiWrapper(async (req: Request) => {
  const { userId } = await req.json();

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

  // 2. Delete user from Auth
  // The profiles table has ON DELETE CASCADE on profiles_id_fkey,
  // so deleting from auth.users will automatically delete from public.profiles.
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("Supabase admin.deleteUser error:", deleteError);
    throw deleteError;
  }

  return NextResponse.json({ success: true });
});
