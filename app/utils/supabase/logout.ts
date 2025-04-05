    import { supabase } from "./client";


    export const handleSignout = async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
      
          console.log("Signed out successfully!");
          window.location.reload(); // Optional: Refresh the page after logout
        } catch (err) {
          console.error("Error signing out:", err);
        }
      };