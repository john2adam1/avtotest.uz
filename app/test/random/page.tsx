import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import { EnhancedTestInterface } from "@/components/enhanced-test-interface"

export default async function RandomTestPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()
  if (!userData) redirect("/login")

  // Redirect admin to admin panel instead of user functions
  if (userData.role === "admin") {
    redirect("/admin")
  }

  if (!userData || !hasActiveAccess(userData)) {
    redirect("/dashboard")
  }

  // Get all tests and shuffle them
  const { data: allTests } = await supabase.from("tests").select("*")

  // Get user settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!allTests || allTests.length === 0) {
    redirect("/dashboard")
  }

  // Shuffle array (Fisher-Yates)
  const shuffledTests = [...allTests]
  for (let i = shuffledTests.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledTests[i], shuffledTests[j]] = [shuffledTests[j], shuffledTests[i]]
  }

  return (
    <EnhancedTestInterface
      title="Tasodifiy Test"
      tests={shuffledTests}
      userId={user.id}
      testType="random"
      userSettings={userSettings}
    />
  )
}

