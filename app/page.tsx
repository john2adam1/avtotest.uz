import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { AboutSection } from "@/components/AboutSection"
import { Statistics } from "@/components/Statistics"
import { ContactSection } from "@/components/ContactSection"
import { Carousel } from "@/components/Carousel"
import { PricesSection } from "@/components/PricesSection"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bosh Sahifa | Tezkor Avtotest",
  description: "O'zbekistondagi eng zamonaviy avtotest platformasi. Bepul testlar va imtihon simulyatori.",
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-heading tracking-tight text-white">SARVAR AVTOTEST</span>
          </div>
          <div className="flex gap-4 items-center">
            <LanguageSwitcher />
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6">
              <Link href="/register">Boshlash</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Hero Section */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
              <span className="text-yellow-400 font-medium text-sm tracking-wide">O'ZBEKISTONDAGI №1 TAYYORLOV MARKAZI</span>
            </div>
          </div>

          <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-white leading-[1.1] tracking-tight mb-8">
            HAYDOVCHILIK <br />
            GUVOHNOMASINI <span className="text-primary">OLISHNING</span> <br />
            ENG OSON YO'LI
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-zinc-400 mb-12 leading-relaxed">
            Bizning online kurslar orqali uydan chiqmasdan yo'l harakati qoidalarini o'rganing va imtihonga tayyorlaning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-16 px-10 rounded-2xl shadow-[0_0_40px_-10px_rgba(250,204,21,0.5)] transition-all hover:scale-105">
              <Link href="/register">Ro'yxatdan o'tish</Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg backdrop-blur-sm transition-all hover:scale-105">
              <Link href="/login">KIRISH</Link>
            </Button>
          </div>
        </div>

        {/* Statistics Section */}
        <Statistics />

        {/* Prices Section */}
        <PricesSection />

        {/* About Section */}
        <AboutSection />

        {/* Carousel */}
        <Suspense fallback={null}>
          <Carousel />
        </Suspense>

        {/* Contact Section */}
        <ContactSection />
      </main>
    </div>
  )
}
