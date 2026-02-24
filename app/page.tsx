import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { LandingHeader } from "@/components/landing-header"
import { LandingHero } from "@/components/landing-hero"
import { AboutSection } from "@/components/AboutSection"
import { Statistics } from "@/components/Statistics"
import { ContactSection } from "@/components/ContactSection"
import { Carousel } from "@/components/Carousel"
import { PricesSection } from "@/components/PricesSection"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bosh Sahifa | Tezkor Avtotest",
  description: "O'zbekistondagi eng zamonaviy avtotest platformasi. Bepul testlar va imtihon simulyatori.",
}

export default async function Home() {
  const supabase = await getSupabaseServerClient()

  // Auto-redirect logged-in users to their dashboard
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userData?.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  // Fetch Prices Data
  const { data: pricesData } = await supabase
    .from("site_content")
    .select("content")
    .eq("type", "prices")
    .maybeSingle()

  const prices = pricesData?.content ?? {
    original_price: "300000",
    discounted_price: "200000",
    discount_percent: "33",
  }

  // Fetch Contact Data
  const { data: contactData } = await supabase
    .from("site_content")
    .select("content")
    .eq("type", "contact")
    .maybeSingle()

  const contact = contactData?.content ?? {
    phone: "",
    telegram: "",
    telegram_link: "",
    address: ""
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Global Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

      <LandingHeader />

      <main className="relative z-10">
        {/* Hero Section */}
        <LandingHero />

        {/* Statistics Section */}
        <Statistics />

        {/* Prices Section */}
        <PricesSection prices={prices} />

        {/* About Section */}
        <AboutSection />

        {/* Carousel */}
        <Suspense fallback={null}>
          <div className="py-24">
            <Carousel />
          </div>
        </Suspense>

        {/* Contact Section */}
        <ContactSection contact={contact} />
      </main>
    </div>
  )
}
