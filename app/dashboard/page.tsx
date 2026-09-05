// app/dashboard/page.tsx
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { DashboardClient } from "@/components/dashboard-client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  let [
    { data: userData },
    { data: topics },
    { data: tickets },
    { count: totalTestsCount },
    { data: contactData },
    { data: examStats },
    { data: topicStats }
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("topics").select("*").order("title"),
    supabase.from("tickets").select("*").order("title"),
    supabase.from("tests").select("*", { count: "exact", head: true }),
    supabase.from("site_content").select("content").eq("type", "contact").maybeSingle(),
    supabase.from("exam_statistics").select("exam_type, percentage").eq("user_id", user.id),
    supabase.from("topic_statistics").select("topic_id, percentage").eq("user_id", user.id)
  ])

  if (!userData) {
    const rawPhone = user.user_metadata?.phone || (user.email ? user.email.replace("@gmail.com", "") : "")
    const cleanPhone = rawPhone.startsWith("+") ? rawPhone : (rawPhone ? `+${rawPhone}` : "+998000000000")
    const now = new Date()
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: createdUser, error: healError } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      phone: cleanPhone,
      role: "user",
      trial_end: trialEnd,
      subscription_end: null,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
    }, { onConflict: "id" }).select().single()

    if (healError || !createdUser) {
      redirect("/login")
    }
    userData = createdUser
  }

  // Redirect admin to admin page instead of loading user dashboard
  if (userData.role === "admin") {
    redirect("/admin")
  }

  // Create stats maps
  const examStatsMap = (examStats || []).reduce((acc: Record<number, number>, stat: any) => {
    acc[stat.exam_type] = stat.percentage
    return acc
  }, {})

  const topicStatsMap = (topicStats || []).reduce((acc: Record<string, number>, stat: any) => {
    acc[stat.topic_id] = stat.percentage
    return acc
  }, {})

  const telegramLink = contactData?.content?.telegram_link || "https://t.me/yourusername"

  return (
    <div className="min-h-screen bg-[#e9f6ff]">
      <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />

      <main className="container mx-auto px-4 py-8">
        <DashboardClient
          user={userData}
          topics={topics || []}
          tickets={tickets || []}
          totalTestsCount={totalTestsCount}
          examStatsMap={examStatsMap}
          topicStatsMap={topicStatsMap}
          telegramLink={telegramLink}
        />
      </main>
    </div>
  )
}