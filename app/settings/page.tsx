import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) redirect("/login")

  // Redirect admin to admin page instead of user settings
  if (userData.role === "admin") {
    redirect("/admin")
  }

  // Get or create user settings
  let { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!userSettings) {
    // Create default settings
    const { data: newSettings } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        question_font_size: 16,
        answer_font_size: 14,
        language: "uz-lat",
      })
      .select()
      .single()
    userSettings = newSettings
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Sozlamalar</h1>
          <SettingsForm initialSettings={userSettings} />
        </div>
      </main>
    </div>
  )
}

