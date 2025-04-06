import { supabase } from "@/app/utils/supabase/client";

export async function loginWithEmail(email: string, password: string) {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
