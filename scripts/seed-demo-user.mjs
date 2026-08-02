import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "vulimwabravin@gmail.com";
const DEMO_PASSWORD = "Code4Cities1.";
const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_ROLES = [
  "viewer",
  "operator",
  "admin",
  "responder",
  "developer",
  "platform_admin",
  "citizen",
];

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureDemoUser() {
  const { data, error } = await supabase.auth.admin.getUserByEmail(DEMO_EMAIL);
  if (error) throw error;

  if (data.user) {
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      {
        password: DEMO_PASSWORD,
        user_metadata: {
          ...(data.user.user_metadata ?? {}),
          full_name: "EWOS Demo User",
          intended_portal: "organization",
        },
      },
    );
    if (updateError) throw updateError;
    return updated.user;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: "EWOS Demo User",
      intended_portal: "organization",
    },
  });
  if (createError) throw createError;
  if (!created.user) throw new Error("Demo user could not be created.");
  return created.user;
}

async function grantDemoAccess(userId) {
  const roleRows = DEMO_ROLES.map((role) => ({
    user_id: userId,
    org_id: DEMO_ORG_ID,
    role,
  }));

  const { error: roleError } = await supabase.from("user_roles").upsert(roleRows, {
    onConflict: "user_id,org_id,role",
  });
  if (roleError) throw roleError;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: "EWOS Demo User",
    avatar_url: null,
    intended_portal: "organization",
  });
  if (profileError) throw profileError;
}

const user = await ensureDemoUser();
await grantDemoAccess(user.id);

console.log(`Demo account ready: ${DEMO_EMAIL}`);
console.log(`Password: ${DEMO_PASSWORD}`);
console.log(`Granted roles: ${DEMO_ROLES.join(", ")}`);
