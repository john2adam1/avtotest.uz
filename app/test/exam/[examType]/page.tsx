import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import { EnhancedTestInterface } from "@/components/enhanced-test-interface"

export default async function ExamTestPage({ params }: { params: Promise<{ examType: string }> }) {
  const { examType } = await params
  console.log("Exam page hit with Type:", examType)
  const supabase = await getSupabaseServerClient()

  const examTypeNum = Number.parseInt(examType)
  if (![20, 50, 100].includes(examTypeNum)) {
    redirect("/dashboard")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  /*
    if (!userData || !hasActiveAccess(userData)) {
      redirect("/dashboard?premium=required")
    }
  */

  // Get all tests
  const { data: allTests } = await supabase.from("tests").select("*")
  console.log(`Exam Debug: allTests count: ${allTests?.length}, required: ${examTypeNum}`)

  // Get user settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!allTests || allTests.length < examTypeNum) {
    console.log("Exam Debug: Redirecting to dashboard - Not enough tests")
    redirect("/dashboard")
  }

  // Shuffle and take first N tests
  const shuffledTests = [...allTests]
  for (let i = shuffledTests.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledTests[i], shuffledTests[j]] = [shuffledTests[j], shuffledTests[i]]
  }

  const selectedTests = shuffledTests.slice(0, examTypeNum)

  return (
    <div className="min-h-screen bg-background">
      <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />
      <EnhancedTestInterface
        title={`Imtihon ${examType}`}
        tests={selectedTests}
        userId={user.id}
        testType="exam"
        testTypeId={examType}
        userSettings={userSettings}
      />
    </div>
  )
}

