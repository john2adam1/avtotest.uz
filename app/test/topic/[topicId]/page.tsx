// app/test/topic/[topicId]/page.tsx
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import { EnhancedTestInterface } from "@/components/enhanced-test-interface"
import { Suspense } from "react"
import { PremiumAccessGuard } from "@/components/premium-access-guard"

async function TopicTestContent({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { data: userData },
    { data: topic },
    { data: userSettings },
    { data: contactData }
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("topics").select("*").eq("id", topicId).single(),
    supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("site_content").select("content").eq("type", "contact").maybeSingle()
  ])

  if (!userData) redirect("/dashboard")

  // Redirect admin to admin panel instead of user functions
  if (userData.role === "admin") {
    redirect("/admin")
  }

  if (!topic) redirect("/dashboard")

  // Fetch tests where category matches topic title
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("category", topic.title)
    .order("created_at")

  if (!tests?.length) redirect("/dashboard")

  const isPremiumRequired = !topic.is_public
  const hasPremium = hasActiveAccess(userData)

  if (isPremiumRequired && !hasPremium) {
    redirect("/dashboard?premium=required")
  }

  const telegramLink = contactData?.content?.telegram_link || "https://t.me/yourusername"

  return (
    <>
      <PremiumAccessGuard telegramLink={telegramLink} />
      <div className="min-h-screen bg-background">
        <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />
        <EnhancedTestInterface
          title={topic.title}
          tests={tests}
          userId={user.id}
          testType="topic"
          testTypeId={topicId}
          userSettings={userSettings}
        />
      </div>
    </>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }): Promise<Metadata> {
  const { topicId } = await params
  const supabase = await getSupabaseServerClient()
  const { data: topic } = await supabase.from("topics").select("title").eq("id", topicId).single()

  return {
    title: topic ? `${topic.title} | Tezkor Avtotest` : "Mavzu Testi",
    description: topic ? `${topic.title} bo'yicha testlarni yeching va bilimingizni mustahkamlang.` : "Mavzu bo'yicha testlar",
  }
}

export default async function TopicTestPage({ params }: { params: Promise<{ topicId: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TopicTestContent params={params} />
    </Suspense>
  )
}