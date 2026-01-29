import { Suspense } from "react"
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
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

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
          <Carousel />
        </Suspense>

        {/* Contact Section */}
        <ContactSection contact={contact} />
      </main>
    </div>
  )
}
