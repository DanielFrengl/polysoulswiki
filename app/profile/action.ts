    import { useState } from "react";
    import { checkUserLoggedIn, supabase } from "../utils/supabase/client";
    import { toast } from "sonner";


    checkUserLoggedIn();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");

    export const updateProfile = async () => {
        if (password !== passwordAgain) {
            toast.error("Passwords do not match");
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .update({ name, username, email, password })
            .eq("id", "user-id"); // Replace "user-id" with the actual user ID

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Profile updated successfully");
        }
    };
