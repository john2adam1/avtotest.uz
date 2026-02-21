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
    <div className="min-h-screen bg-[#e9f6ff]">
      <Navbar userEmail={user.email} isAdmin={true} />

      <main className="container mx-auto px-4 py-12">
        <div className="pb-6 border-b-2 border-gray-300 mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-widest text-[#0f172a]">Admin Panel</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-10">
          <TabsList className="grid w-full grid-cols-7 bg-gray-200 p-1 border-2 border-gray-300 h-auto">
            <TabsTrigger value="users" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="topics" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Mavzular</TabsTrigger>
            <TabsTrigger value="tests" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Testlar</TabsTrigger>
            <TabsTrigger value="tickets" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Biletlar</TabsTrigger>
            <TabsTrigger value="carousel" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Karousel</TabsTrigger>
            <TabsTrigger value="prices" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Narxlar</TabsTrigger>
            <TabsTrigger value="contact" className="py-4 font-bold rounded-none data-[state=active]:bg-[#1976d2] data-[state=active]:text-white">Bog'lanish</TabsTrigger>
          </TabsList>
          {/* ... tabs content sits directly on background ... */}

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="topics">
            <TopicsManagement />
          </TabsContent>

          <TabsContent value="tests">
            <TestsManagement />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsManagement />
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselManagement />
          </TabsContent>

          <TabsContent value="prices">
            <PricesManagement />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}