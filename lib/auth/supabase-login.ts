import { createClient } from "@/utils/supabase/client";

export async function loginWithEmail(email: string, password: string) {
  const { error, data } = await createClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
