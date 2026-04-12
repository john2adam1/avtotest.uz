import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { AnswersClient } from "@/components/answers-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft } from "lucide-react"

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
        <div className="min-h-screen bg-[#e9f6ff]">
            <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />
            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="mb-10">
                    <Button asChild className="px-5 h-9 bg-[#1875d1] hover:bg-[#1565c0] text-white rounded font-normal text-sm gap-1.5 shadow-sm transition-all active:scale-95">
                        <Link href="/dashboard" className="inline-flex items-center gap-1.5">
                            <ChevronLeft className="h-4 w-4" />
                            Ortga
                        </Link>
                    </Button>
                </div>

                <div className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Barcha testlar javoblari</h1>
                    <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">Barcha mavjud test savollari va ularning to&apos;g&apos;ri javoblari</p>
                </div>
                <AnswersClient tests={tests || []} />
            </main>
        </div>
    )
}
