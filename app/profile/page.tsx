import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          username: user.username ?? "",
          bio: user.bio ?? "",
        }}
      />
    </div>
  );
}
