import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");

if (!fs.existsSync(envPath)) {
  console.error(".env.local not found at", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim().replace(/"/g, "");
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables in .env.local.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const users = [
  { name: 'RISHAD', email: 'Rishad@mrc.com', password: '#Rishad@mrc2026' },
  { name: 'SABEEL', email: 'sabeel@mrc.com', password: 'Mrc@2026' },
  { name: 'SHAFEEQUE', email: 'shafeeque@mrc.com', password: 'Mrc@2026' },
  { name: 'RAZI', email: 'Razi@mrc.com', password: 'Razick@2026' }
];

async function run() {
  console.log("🚀 Starting Bulk User Creation...");
  
  // Fetch all users once to avoid multiple listUsers() calls
  const { data: { users: existingUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error("❌ Error fetching existing users:", listError.message);
    process.exit(1);
  }

  for (const u of users) {
    console.log(`\nProcessing: ${u.name} <${u.email}>`);
    
    let userId;
    const existing = existingUsers.find(usr => usr.email?.toLowerCase() === u.email.toLowerCase());

    if (existing) {
      console.log("   ⚠️ User already exists in Auth. Updating metadata...");
      userId = existing.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: 'employee', display_name: u.name }
      });
      
      if (updateError) {
        console.error("   ❌ Update Error:", updateError.message);
      } else {
        console.log("   ✅ Auth User Updated.");
      }
    } else {
      // Create new user
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: 'employee', display_name: u.name }
      });

      if (createError) {
        console.error("   ❌ Error:", createError.message);
        continue;
      }
      
      userId = userData.user.id;
      console.log("   ✅ Created Auth User.");
    }

    // 2. Explicitly update/create Profile
    if (userId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: u.email.toLowerCase(),
          role: 'employee',
          display_name: u.name
        });
      
      if (profileError) console.error("   ❌ Profile Error:", profileError.message);
      else console.log("   ✅ Profile Synced.");
    }
  }
  
  console.log("\n✨ Bulk Process Complete!");
}

run();
