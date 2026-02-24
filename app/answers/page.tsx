import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { AnswersClient } from "@/components/answers-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnswersPage() {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()
    if (!userData) redirect("/login")

    // Redirect admin to admin page instead of user-side answers
    if (userData.role === "admin") {
        redirect("/admin")
    }

    // Fetch all tests
    const { data: tests } = await supabase
        .from("tests")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen bg-[#f1f5f9]">
            <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="mb-4 hover:bg-white/50 text-[#0369a1]">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Orqaga
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Barcha testlar javoblari</h1>
                    <p className="text-gray-500 mt-2">Barcha mavjud test savollari va ularning to'g'ri javoblari</p>
                </div>
                <AnswersClient tests={tests || []} />
            </main>
        </div>
    )
}
