"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Create a separate Admin client using Service Role Key
const getAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
        throw new Error("Missing Supabase URL or Service Role Key")
    }

    return createClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

export async function adminUpdateUserPassword(userId: string, newPassword: string) {
    try {
        // 1. Verify the current user is an admin
        const supabase = await getSupabaseServerClient()
        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
            return { error: "Utorizatsiyadan o'tmagansiz" }
        }

        const { data: userData } = await supabase.from("users").select("role").eq("id", currentUser.id).single()

        if (!userData || userData.role !== "admin") {
            return { error: "Sizda bu amalni bajarish uchun huquq yo'q" }
        }

        // 2. Perform the update using Service Role
        const adminClient = getAdminClient()
        const { error } = await adminClient.auth.admin.updateUserById(userId, {
            password: newPassword,
        })

        if (error) throw error

        revalidatePath("/admin")
        return { success: true }
    } catch (error: any) {
        console.error("Error updating password:", error)
        return { error: error.message || "Parolni yangilashda xatolik yuz berdi" }
    }
}
