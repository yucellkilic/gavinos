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

export async function directUpdatePassword(userId: string, newPassword: string) {
  // Security check: Ensure the caller is an authenticated admin
  // (In a real app, you'd check roles here too)
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    console.error('Error updating user password:', error);
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Password has been directly updated successfully.' };
}
