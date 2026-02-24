// app/test/ticket/[ticketId]/page.tsx
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import { EnhancedTestInterface } from "@/components/enhanced-test-interface"
import { Suspense } from "react"
import { PremiumAccessGuard } from "@/components/premium-access-guard"

async function TicketTestContent({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params
  console.log("Ticket page hit with ID:", ticketId)
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { data: userData },
    { data: ticket },
    { data: ticketTests },
    { data: userSettings },
    { data: contactData }
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("tickets").select("*").eq("id", ticketId).single(),
    supabase.from("ticket_tests").select(`
      *,
      tests (*)
    `).eq("ticket_id", ticketId).order("order_index"),
    supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("site_content").select("content").eq("type", "contact").maybeSingle()
  ])

  console.log("Ticket Debug: User:", !!userData)
  console.log("Ticket Debug: Ticket:", !!ticket)
  console.log("Ticket Debug: TicketTests:", ticketTests?.length)

  if (!userData) {
    console.log("Ticket Debug: Redirecting - No User Data")
    redirect("/dashboard")
  }

  // Redirect admin to admin panel instead of user functions
  if (userData.role === "admin") {
    redirect("/admin")
  }
  if (!ticket || !ticketTests || ticketTests.length === 0) {
    console.log("Ticket Debug: Redirecting - No Ticket Data")
    redirect("/dashboard")
  }

  const tests = ticketTests.map((tt: any) => tt.tests).filter(Boolean)
  console.log("Ticket Debug: Tests count:", tests.length)

  if (tests.length === 0) {
    console.log("Ticket Debug: Redirecting - No Tests found")
    redirect("/dashboard")
  }

  const isPremiumRequired = !(ticket as any).is_public
  const hasPremium = hasActiveAccess(userData)

  if (isPremiumRequired && !hasPremium) {
    redirect("/dashboard?premium=required")
  }

  const telegramLink = contactData?.content?.telegram_link || "https://t.me/yourusername"

  return (
    <>
      <PremiumAccessGuard telegramLink={telegramLink} />
      <PremiumAccessGuard telegramLink={telegramLink} />
      <EnhancedTestInterface
        title={ticket.title}
        tests={tests}
        userId={user.id}
        testType="ticket"
        testTypeId={ticketId}
        userSettings={userSettings}
      />
    </>
  )
}

export default async function TicketTestPage({ params }: { params: Promise<{ ticketId: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketTestContent params={params} />
    </Suspense>
  )
}