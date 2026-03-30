import { supabaseAdmin } from "@/lib/supabase-admin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // 1. Initial admin credentials from user request
    const adminEmail = "razimuhammedmrc@gmail.com"
    const adminPass = "MRC@2026#"

    // 2. Employee list
    const employees = [
      { email: "employee1@mrc.com", password: "WelcomeMRC2026!" },
      { email: "employee2@mrc.com", password: "WelcomeMRC2026!" },
      { email: "employee3@mrc.com", password: "WelcomeMRC2026!" },
      { email: "employee4@mrc.com", password: "WelcomeMRC2026!" }
    ]

    // 3. Create/Sync Admin
    const { data: adminUser, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPass,
      email_confirm: true
    })

    // If user already exists, we still want to update their profile with the password for reference
    const adminId = adminUser?.user?.id || (await supabaseAdmin.from('profiles').select('id').eq('email', adminEmail).single()).data?.id;

    if (adminId) {
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin', password: adminPass })
        .eq('id', adminId)
    }

    // 4. Create/Sync 4 Employees
    for (const emp of employees) {
      const { data: empUser, error: empErr } = await supabaseAdmin.auth.admin.createUser({
        email: emp.email,
        password: emp.password,
        email_confirm: true
      })

      const empId = empUser?.user?.id || (await supabaseAdmin.from('profiles').select('id').eq('email', emp.email).single()).data?.id;

      if (empId) {
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'employee', password: emp.password })
          .eq('id', empId)
      }
    }

    return NextResponse.json({ success: true, message: "System seeded with 1 Admin and 4 Employees." })
  } catch (err: any) {
    console.error("Setup error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
