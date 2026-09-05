"use server"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { normalizeUzbekPhone } from "@/lib/phone"

type RegistrationResult = {
    success?: boolean
    error?: string
}

export async function registerUserWithPhone(prevState: any, formData: FormData): Promise<RegistrationResult> {
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string
    const firstName = ((formData.get("firstName") as string) || "").trim()
    const lastName = ((formData.get("lastName") as string) || "").trim()

    // Basic validation
    if (!password || password.length < 6) {
        return { error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }
    }

    const { cleanPhone, authEmail, isValid } = normalizeUzbekPhone(phone)
    if (!isValid) {
        return { error: "Telefon raqami noto'g'ri kiritildi (Masalan: +998 90 123 45 67)" }
    }

    const supabaseAdmin = getSupabaseAdminClient()

    try {
        let userId: string | null = null

        // 1. Try creating user in Auth (verified)
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.createUser({
            email: authEmail,
            password: password,
            email_confirm: true, // Auto-verify email
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                phone: cleanPhone,
            }
        })

        if (linkError) {
            const isAlreadyRegistered =
                linkError.message?.toLowerCase().includes("already") ||
                linkError.message?.toLowerCase().includes("exists")

            if (isAlreadyRegistered) {
                // Check if user already exists in public.users
                const { data: existingProfile } = await supabaseAdmin
                    .from("users")
                    .select("id")
                    .eq("phone", cleanPhone)
                    .maybeSingle()

                if (existingProfile) {
                    return { error: "Bu raqam allaqachon ro'yxatdan o'tgan" }
                }

                // If user was in auth.users without a public.users profile, find and repair them
                const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
                const foundUser = (listData?.users as any[])?.find((u: any) => u.email === authEmail)

                if (foundUser) {
                    userId = foundUser.id
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        password: password,
                        email_confirm: true,
                        user_metadata: {
                            first_name: firstName,
                            last_name: lastName,
                            phone: cleanPhone,
                        }
                    })
                } else {
                    return { error: "Bu raqam allaqachon ro'yxatdan o'tgan" }
                }
            } else {
                console.error("Auth create error:", linkError)
                return { error: linkError.message }
            }
        } else if (linkData?.user) {
            userId = linkData.user.id
        }

        if (!userId) {
            return { error: "Foydalanuvchi yaratilmadi" }
        }

        // 2. Create Profile in public.users
        // 7 days trial
        const now = new Date()
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const { error: profileError } = await supabaseAdmin.from("users").upsert({
            id: userId,
            email: authEmail,
            phone: cleanPhone,
            role: "user",
            trial_end: trialEnd,
            subscription_end: null,
            first_name: firstName || null,
            last_name: lastName || null,
        }, {
            onConflict: "id"
        })

        if (profileError) {
            console.error("Profile create error:", profileError)
            return { error: "Profil yaratishda xatolik: " + profileError.message }
        }

        return { success: true }
    } catch (err: any) {
        console.error("Registration error:", err)
        return { error: err.message || "Tizim xatoligi" }
    }
}
