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

      <main className="pt-20">
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
