import { supabase } from "@/app/utils/supabase/client";

export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
  name?: string
) {
  // 1. Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  const userId = signUpData.user?.id;

  if (!userId) {
    throw new Error("User ID not returned from signup.");
  }

  // 2. Create profile
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      user_id: userId,
      username,
      name,
    },
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return signUpData;
}
