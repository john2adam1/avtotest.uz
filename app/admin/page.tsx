// app/admin/page.tsx - OPTIMIZED VERSION
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManagement } from "@/components/admin/user-management"
import { TopicsManagement } from "@/components/admin/topics-management"
import { TestsManagement } from "@/components/admin/tests-management"
import ContactManager from "@/components/admin/ContactManager"
import { TicketsManagement } from "@/components/admin/tickets-management"
import { CarouselManagement } from "@/components/admin/carousel-management"
import { PricesManagement } from "@/components/admin/prices-management"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient()

  // Get user and check admin role in one query chain
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  // Redirect non-admin users immediately
  if (!userData || userData.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#e9f6ff] relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob" />
      <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-purple-500/5 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob animation-delay-2000" />

      <Navbar userEmail={user.email} isAdmin={true} />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="users" className="space-y-8">
          <div className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-xl shadow-blue-500/5 overflow-x-auto no-scrollbar">
            <TabsList className="flex w-max lg:w-full bg-transparent gap-1.5 h-auto p-0 border-none">
              {[
                { value: "users", label: "Foydalanuvchilar" },
                { value: "topics", label: "Mavzular" },
                { value: "tests", label: "Testlar" },
                { value: "tickets", label: "Biletlar" },
                { value: "carousel", label: "Karousel" },
                { value: "prices", label: "Narxlar" },
                { value: "contact", label: "Bog'lanish" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-4 py-2.5 font-bold text-xs tracking-wide rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-500 hover:text-blue-600 transition-all duration-300 border-none shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative">
            <TabsContent value="users" className="m-0 border-none outline-none focus:ring-0">
              <UsersManagement />
            </TabsContent>

            <TabsContent value="topics" className="m-0 border-none outline-none focus:ring-0">
              <TopicsManagement />
            </TabsContent>

            <TabsContent value="tests" className="m-0 border-none outline-none focus:ring-0">
              <TestsManagement />
            </TabsContent>

            <TabsContent value="tickets" className="m-0 border-none outline-none focus:ring-0">
              <TicketsManagement />
            </TabsContent>

            <TabsContent value="carousel" className="m-0 border-none outline-none focus:ring-0">
              <CarouselManagement />
            </TabsContent>

            <TabsContent value="prices" className="m-0 border-none outline-none focus:ring-0">
              <PricesManagement />
            </TabsContent>

            <TabsContent value="contact" className="m-0 border-none outline-none focus:ring-0">
              <ContactManager />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
