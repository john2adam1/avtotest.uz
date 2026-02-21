"use client"

import { Button } from "@/components/ui/button"
import { Phone, MapPin, Send } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ContactData } from "@/lib/landing-types"

interface ContactSectionProps {
  contact: ContactData
}

import { useState, useEffect } from "react"

export function ContactSection({ contact }: ContactSectionProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="contact" className="py-24 relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{t("contact_section.title")}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("contact_section.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contact.phone && (
              <div className="group glass-dark rounded-[2rem] p-8 text-center border-white/5 transition-all duration-500 hover:border-primary/30 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
                  <Phone className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("contact_section.phone")}</h3>
                <a href={`tel:${contact.phone}`} className="text-primary font-bold text-lg hover:underline transition-all">
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.telegram_link && (
              <div className="group glass-dark rounded-[2rem] p-8 text-center border-white/5 transition-all duration-500 hover:border-sky-500/30 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-500 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-sky-500/10">
                  <Send className="h-8 w-8 text-sky-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("contact_section.telegram")}</h3>
                <Button asChild variant="link" className="p-0 h-auto font-bold text-lg text-sky-500 hover:text-sky-400 transition-colors">
                  <a href={contact.telegram_link} target="_blank" rel="noopener noreferrer">
                    {contact.telegram || t("contact_section.telegram_link")}
                  </a>
                </Button>
              </div>
            )}

            {contact.address && (
              <div className="group glass-dark rounded-[2rem] p-8 text-center border-white/5 transition-all duration-500 hover:border-indigo-500/30 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-indigo-500/10">
                  <MapPin className="h-8 w-8 text-indigo-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("contact_section.address")}</h3>
                <p className="text-base text-slate-400 font-medium leading-relaxed">
                  {contact.address}
                </p>
              </div>
            )}
          </div>

          {!contact.phone && !contact.telegram_link && !contact.address && (
            <div className="glass-dark rounded-[2rem] p-16 text-center border-dashed border-white/10 mt-8">
              <p className="text-lg text-slate-500 font-bold">
                {t("contact_section.no_data")}
              </p>
            </div>
          )}

          <div className="mt-24 pt-12 border-t border-white/5 text-center">
            <p className="text-slate-600 text-sm font-medium tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Tezkor Avtotest. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
