import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { LandingHeader } from "@/components/landing-header"
import { LandingHero } from "@/components/landing-hero"
import { TargetAudience } from "@/components/TargetAudience"
import { FeaturesGrid } from "@/components/FeaturesGrid"
import { AboutSection } from "@/components/AboutSection"
import { ContactSection } from "@/components/ContactSection"
import { Carousel } from "@/components/Carousel"
import { PricesSection } from "@/components/PricesSection"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sarvar Avto Test — Bepul YHQ Testlari va Haydovchilik Imtihoni",
  description:
    "Sarvar Avto Test — O'zbekistonda haydovchilik imtihoniga tayyorlanish uchun №1 platforma. sarvaravtotest.uz: bepul YHQ testlari, 2024-2025 biletlar, mavzular bo'yicha testlar va imtihon simulyatori.",
  keywords: [
    "sarvar avtotest",
    "sarvar avto test",
    "bepul avtotest",
    "yhq testlari",
    "haydovchilik imtihoni 2024",
    "haydovchilik imtihoni 2025",
    "pdd testlari o'zbek",
    "avtomaktab testi",
  ],
  alternates: {
    canonical: "https://sarvaravtotest.uz",
  },
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
    <div className="min-h-screen relative overflow-hidden bg-[#eff8fc]">

      <LandingHeader />

      <main className="relative z-10">
        {/* Hero Section */}
        <LandingHero />

        {/* Target Audience Section */}
        <TargetAudience />

        {/* Features Grid Section */}
        <FeaturesGrid />

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
