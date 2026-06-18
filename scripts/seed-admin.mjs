// Creates (or promotes) the first admin account.
// Usage: node scripts/seed-admin.mjs <email> <password>
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) process.env[m[1]] ??= m[2];
    }
  } catch {
    /* ignore */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2] || "samir22092003@gmail.com";
const password = process.argv[3] || "Admin123!";

if (!url || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`→ Creating admin user: ${email}`);

  let userId;
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });

  if (createErr) {
    if (/already|registered|exists/i.test(createErr.message)) {
      console.log("  User already exists, looking it up…");
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list.users.find((u) => u.email === email);
      if (!existing) throw new Error("Could not find existing user");
      userId = existing.id;
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
  }

  console.log(`  User id: ${userId}`);

  // Ensure a profile row exists and promote it to admin.
  const { error: upsertErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: "Admin",
      role: "admin",
      approved: true,
    },
    { onConflict: "id" }
  );
  if (upsertErr) throw upsertErr;

  console.log("✓ Admin account ready.");
  console.log(`  Login:    ${email}`);
  console.log(`  Password: ${password}`);
}

main().catch((e) => {
  console.error("✗ Failed:", e.message);
  process.exit(1);
});
