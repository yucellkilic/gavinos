'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client with service role key for auth operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function listAdminUsers() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    return { success: false, users: [] };
  }

  // Filter or map users to return only necessary info
  return { 
    success: true, 
    users: users.map(u => ({ id: u.id, email: u.email })) 
  };
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) {
    console.error('Error generating reset link:', error);
    return { success: false, message: error.message };
  }

  // In a real scenario, you'd send an email here or return the link
  // But for this request, we'll use the standard Supabase reset password email trigger
  const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings`,
  });

  if (resetError) {
    return { success: false, message: resetError.message };
  }

  return { success: true, message: 'Password reset email sent successfully.' };
}
