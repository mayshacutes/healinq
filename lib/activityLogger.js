import { supabase } from "./supabaseClient";

export const logActivity = async ({
    actor_id,
    actor_name,
    actor_role,
    action,
    category,
    status = "Completed",
    description = "",
}) => {
    try {
        const { error } = await supabase.from("activity_logs").insert([
            {
                actor_id,
                actor_name,
                actor_role,
                action,
                category,
                status,
                description,
            },
        ]);

        if (error) {
            console.error("Activity Log Error Full:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
        }
    } catch (err) {
        console.error(err);
    }
};