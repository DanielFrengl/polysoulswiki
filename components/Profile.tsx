// Ensure this component file starts with the 'use client' directive
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Assuming your Supabase client setup is compatible with App Router client components
import { supabase } from "@/app/utils/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { handleSignout } from "@/app/utils/supabase/logout";
import { LogOut } from "lucide-react";

// Removed the top-level checkUserLoggedIn() call - it should run inside useEffect or be handled by middleware/page

export function UserProfileForm() {
  const router = useRouter(); // Use router from next/navigation

  // State for user profile data
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>(""); // Email likely comes from auth user

  // State for password change
  const [password, setPassword] = useState<string>("");
  const [passwordAgain, setPasswordAgain] = useState<string>("");

  // Component state
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch user and profile data on mount
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      setLoading(true);
      // Get user session directly on the client
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth Error or No User:", authError);
        // Redirect to login if not authenticated
        // This might flash the loading state briefly before redirecting
        toast.error("You must be logged in to view this page.");
        router.push("/login"); // Or your login route
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) {
        setCurrentUser(user);
        setEmail(user.email || ""); // Get email from auth user

        // Fetch profile data from 'profiles' table
        console.log("Attempting to fetch profile for user ID:", user.id); // Add this line
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, username")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // Ignore 'row not found' for new users
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to load profile data.");
        } else if (profileData) {
          setName(profileData.name || "");
          setUsername(profileData.username || "");
        }
        // Even if profile fetch fails or returns null, we stop loading
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Add router dependency

  // --- Update Profile Logic (largely unchanged) ---
  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast.error("No user session found. Please log in again.");
      // Consider redirecting here too if session somehow became invalid
      // router.push('/login');
      return;
    }

    // Password Validation
    if (password && password !== passwordAgain) {
      toast.error("New passwords do not match.");
      return;
    }

    setUpdating(true);
    let profileUpdateError = null;
    let authUpdateError = null;
    let authUpdatesMade = false;
    let profileUpdatesMade = false;

    try {
      // --- Update Supabase Auth (Email/Password) ---
      const authUpdates: {
        email?: string;
        password?: string;
        data?: Record<string, any>;
      } = {};
      // You might want to update metadata instead of top-level fields depending on your setup
      // Example: authUpdates.data = { name: name } // If storing name in auth metadata

      if (email && email !== currentUser.email) {
        authUpdates.email = email;
      }
      if (password) {
        authUpdates.password = password;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser(authUpdates);
        if (error) {
          authUpdateError = error;
          console.error("Auth update error:", error);
          toast.error(
            `Failed to update ${Object.keys(authUpdates)
              .filter((k) => k !== "data")
              .join("/")}: ${error.message}`
          );
        } else {
          authUpdatesMade = true;
          if (authUpdates.email) {
            toast.info(
              "Please check your new email address for a confirmation link."
            );
            // You might want to optimistically update the state or wait for confirmation
            // setEmail(authUpdates.email);
          }
          if (authUpdates.password) {
            toast.success("Password updated successfully.");
            setPassword("");
            setPasswordAgain("");
          }
          // Refresh current user state after successful auth update
          const {
            data: { user: updatedUser },
          } = await supabase.auth.getUser();
          if (updatedUser) setCurrentUser(updatedUser);
        }
      }

      // --- Update 'profiles' Table (Name/Username) ---
      // Fetch current profile state just before updating to compare
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("name, username")
        .eq("user_id", currentUser.id)
        .single();

      const profileUpdates: { name?: string; username?: string } = {};
      // Only add to update object if value actually changed
      if (name !== (currentProfile?.name ?? "")) {
        // Use nullish coalescing
        profileUpdates.name = name;
      }
      if (username !== (currentProfile?.username ?? "")) {
        // Use nullish coalescing
        profileUpdates.username = username;
      }

      // Only update if there are changes and no critical auth error occurred
      if (Object.keys(profileUpdates).length > 0 && !authUpdateError) {
        // Upsert logic: If profile doesn't exist (currentProfile is null), insert; otherwise, update.
        const query = currentProfile
          ? supabase
              .from("profiles")
              .update(profileUpdates)
              .eq("user_id", currentUser.id)
          : supabase
              .from("profiles")
              .insert({ user_id: currentUser.id, ...profileUpdates });

        const { error } = await query;

        if (error) {
          profileUpdateError = error;
          console.error("Profile update/insert error:", error);
          toast.error(`Failed to update profile details: ${error.message}`);
        } else {
          profileUpdatesMade = true;
        }
      }

      // --- Final Success Message ---
      if (
        !authUpdateError &&
        !profileUpdateError &&
        (authUpdatesMade || profileUpdatesMade)
      ) {
        toast.success("Profile updated successfully!");
      } else if (
        !authUpdatesMade &&
        !profileUpdatesMade &&
        !authUpdateError &&
        !profileUpdateError
      ) {
        // Only show 'no changes' if no errors occurred
        toast.info("No changes detected.");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error("An unexpected error occurred during the update.");
    } finally {
      setUpdating(false);
    }
  };

  // --- Render Logic (mostly unchanged) ---

  // Initial Loading State
  if (loading) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        {" "}
        {/* Adjust width as needed */}
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading your profile...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          {/* Add a spinner or skeleton loader here */}
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // This state might not be reached if redirect happens quickly in useEffect,
  // but good as a fallback or if redirect fails silently.
  if (!currentUser && !loading) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your profile.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main Form Render
  return (
    <Card className="w-full max-w-xl mx-auto">
      {" "}
      {/* Use responsive width */}
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-x-2">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Edit your profile details below.</CardDescription>
          </div>
          <Button
            variant="destructive"
            className="hover:opacity-80"
            onClick={handleSignout}
          >
            <LogOut />
            Log out
          </Button>
        </div>
      </CardHeader>
      {/* Bind onSubmit to the form element */}
      <form onSubmit={handleUpdateProfile}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            {/* Name Input */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updating}
                autoComplete="name"
              />
            </div>

            {/* Username Input */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Your public username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={updating}
                autoComplete="username"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled
              />
              {/* Optional: Add a note if email change triggers confirmation */}
              {email !== currentUser?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  Changing your email will require confirmation.
                </p>
              )}
            </div>

            {/* Password Section */}
            <hr className="my-4" />
            <p className="text-sm font-medium">Update Password</p>
            <p className="text-sm text-muted-foreground mb-2">
              Leave fields blank to keep your current password.
            </p>

            {/* New Password Input */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password" // Avoid using 'password' as id if autocomplete causes issues
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={updating}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm New Password Input */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
                // Disable if updating or if new password field is empty
                disabled={updating || !password}
                autoComplete="new-password" // Use same autocomplete value
              />
              {password && password !== passwordAgain && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match.
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
          {/* Changed Cancel to use router.back() for more generic back navigation */}
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updating || loading}>
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
